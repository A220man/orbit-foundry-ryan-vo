import hashlib
import secrets
import base64
from typing import Optional


class PKCEUtils:
    """Utilities for PKCE (Proof Key for Code Exchange) flow"""
    
    @staticmethod
    def generate_code_verifier(length: int = 64) -> str:
        """Generate a random code verifier string"""
        return secrets.token_urlsafe(length)
    
    @staticmethod
    def generate_code_challenge(code_verifier: str) -> str:
        """Generate a code challenge from code verifier using SHA256"""
        hash_obj = hashlib.sha256(code_verifier.encode('utf-8'))
        challenge = base64.urlsafe_b64encode(hash_obj.digest()).decode('utf-8')
        # Remove trailing '=' characters
        return challenge.rstrip('=')
    
    @staticmethod
    def generate_state(length: int = 32) -> str:
        """Generate a random state parameter for security"""
        return secrets.token_urlsafe(length)


class SessionManager:
    """Simple session management for auth state"""
    
    def __init__(self):
        self.sessions = {}  # In production, use Redis or database
    
    def create_session(self, user_id: str, username: str, roles: list) -> str:
        """Create a new session and return session ID"""
        session_id = secrets.token_urlsafe(32)
        self.sessions[session_id] = {
            'user_id': user_id,
            'username': username,
            'roles': roles,
            'created_at': None
        }
        return session_id
    
    def get_session(self, session_id: str) -> Optional[dict]:
        """Get session data by session ID"""
        return self.sessions.get(session_id)
    
    def delete_session(self, session_id: str) -> None:
        """Delete a session"""
        if session_id in self.sessions:
            del self.sessions[session_id]


# Global session manager instance
session_manager = SessionManager()
