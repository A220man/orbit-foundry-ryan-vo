from fastapi import APIRouter, Request, HTTPException, Depends, Response
from fastapi.responses import RedirectResponse, JSONResponse
from urllib.parse import urlencode
import secrets
import base64
import hashlib
import os

from app.core.security import PKCEUtils, session_manager
from app.core.config import get_settings
from app.models.schemas import APIResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/login", response_class=RedirectResponse)
async def login(request: Request):
    """Initiate OIDC login with PKCE.
    
    In demo mode, creates a local session and redirects to frontend.
    In production with Keycloak, redirects to Keycloak authorization endpoint.
    """
    settings = get_settings()
    
    # Demo mode: create local session
    if not settings.oidc_enabled or settings.demo_mode:
        user_id = "demo-user"
        username = "Demo User"
        roles = ["viewer"]
        session_id = session_manager.create_session(user_id, username, roles)
        
        # Set session cookie
        response = JSONResponse({"success": True, "session_id": session_id})
        response.set_cookie(
            key="orbitsession",
            value=session_id,
            httponly=True,
            samesite="lax",
            secure=False,  # True in production with HTTPS
            path="/",
        )
        return response
    
    # Production: generate PKCE parameters and redirect to Keycloak
    code_verifier = PKCEUtils.generate_code_verifier()
    code_challenge = PKCEUtils.generate_code_challenge(code_verifier)
    
    # Store code_verifier in session for later exchange
    request.session["oidc_code_verifier"] = code_verifier
    
    # Build Keycloak authorization URL
    auth_params = {
        "client_id": settings.oidc_client_id,
        "redirect_uri": settings.oidc_redirect_uri,
        "response_type": "code",
        "scope": "openid profile email",
        "code_challenge": code_challenge,
        "code_challenge_method": "S256",
        "state": PKCEUtils.generate_state(),
    }
    
    base_url = settings.oidc_issuer_url.rstrip("/")
    auth_url = f"{base_url}/protocol/openid-connect/auth?{urlencode(auth_params)}"
    
    return RedirectResponse(url=auth_url)


@router.get("/callback")
async def callback(request: Request):
    """Handle OIDC callback from Keycloak after user authorization."""
    from app.core.security import PKCEUtils
    
    settings = get_settings()
    
    # Get authorization code from query params
    code = None
    if request.query_params.get("code"):
        code = request.query_params.get("code")
    elif request.query_params.get("error"):
        # User denied authorization
        error = request.query_params.get("error", "access_denied")
        return JSONResponse(
            {"success": False, "error": error},
            status_code=400,
        )
    
    # Get code verifier from session
    code_verifier = request.session.get("oidc_code_verifier")
    if not code_verifier:
        raise HTTPException(status_code=400, detail="Missing code verifier")
    
    # Exchange authorization code for tokens
    token_params = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": settings.oidc_redirect_uri,
        "client_id": settings.oidc_client_id,
        "code_verifier": code_verifier,
    }
    
    # Token endpoint
    base_url = settings.oidc_issuer_url.rstrip("/")
    token_url = f"{base_url}/protocol/openid-connect/token"
    
    import httpx
    async with httpx.AsyncClient() as client:
        token_resp = await client.post(token_url, data=token_params)
    
    if token_resp.status_code != 200:
        raise HTTPException(
            status_code=400,
            detail=f"Token exchange failed: {token_resp.text}",
        )
    
    tokens = token_resp.json()
    
    # Create session from tokens
    user_id = tokens.get("sub", "unknown-user")
    username = tokens.get("preferred_username", "Unknown User")
    roles = ["viewer"]  # Default role; would come from token claims
    
    session_id = session_manager.create_session(user_id, username, roles)
    
    # Set session cookie
    response = JSONResponse({"success": True, "session_id": session_id})
    response.set_cookie(
        key="orbitsession",
        value=session_id,
        httponly=True,
        samesite="lax",
        secure=False,  # True in production with HTTPS
        path="/",
    )
    
    return response


@router.post("/logout")
async def logout(response: Response):
    """Logout and clear session."""
    # Clear the session cookie
    response.set_cookie(
        key="orbitsession",
        value="",
        httponly=True,
        samesite="lax",
        secure=False,
        path="/",
        expires=0,
    )
    
    return JSONResponse({"success": True, "message": "Logged out successfully"})


@router.get("/me", response_model=APIResponse)
async def me(request: Request):
    """Get current user info from session."""
    session_id = request.cookies.get("orbitsession")
    if not session_id:
        return APIResponse(success=False, data=None, error="Unauthorized")
    
    session = session_manager.get_session(session_id)
    if not session:
        return APIResponse(success=False, data=None, error="Session expired")
    
    return APIResponse(
        success=True,
        data={
            "user_id": session["user_id"],
            "username": session["username"],
            "roles": session["roles"],
        }
    )
