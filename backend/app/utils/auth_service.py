import os
import logging
from typing import Optional
import requests
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

# Token cache to avoid repeated authentication
_token_cache = {
    "access_token": None,
    "expires_at": None
}


def get_access_token() -> str:
    """
    Get OAuth2 access token for Dataverse API
    Uses Azure AD authentication with cached tokens
    
    Returns:
        Access token string
    
    Raises:
        Exception: If token retrieval fails
    """
    global _token_cache
    
    # Check if cached token is still valid
    if _token_cache["access_token"] and _token_cache["expires_at"]:
        if datetime.now() < _token_cache["expires_at"]:
            logger.debug("[v0] Using cached access token")
            return _token_cache["access_token"]
    
    try:
        # Get credentials from environment variables
        tenant_id = os.getenv("AZURE_TENANT_ID")
        client_id = os.getenv("AZURE_CLIENT_ID")
        client_secret = os.getenv("AZURE_CLIENT_SECRET")
        
        if not all([tenant_id, client_id, client_secret]):
            raise ValueError("Missing Azure credentials in environment variables")
        
        # Azure AD token endpoint
        token_url = f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"
        
        # Request token
        payload = {
            "grant_type": "client_credentials",
            "client_id": client_id,
            "client_secret": client_secret,
            "scope": "https://org.crm.dynamics.com/.default"
        }
        
        logger.debug(f"[v0] Requesting token from {token_url}")
        response = requests.post(token_url, data=payload)
        response.raise_for_status()
        
        token_data = response.json()
        access_token = token_data.get("access_token")
        expires_in = token_data.get("expires_in", 3600)  # Default 1 hour
        
        if not access_token:
            raise ValueError("No access token in response")
        
        # Cache the token with expiration time (refresh 5 min before expiry)
        _token_cache["access_token"] = access_token
        _token_cache["expires_at"] = datetime.now() + timedelta(seconds=expires_in - 300)
        
        logger.info("[v0] Successfully obtained new access token")
        return access_token
    
    except requests.exceptions.RequestException as e:
        logger.error(f"[v0] Request error during token retrieval: {str(e)}")
        raise Exception(f"Failed to get access token: {str(e)}")
    except Exception as e:
        logger.error(f"[v0] Error during authentication: {str(e)}")
        raise


def clear_token_cache():
    """Clear the cached access token"""
    global _token_cache
    _token_cache = {
        "access_token": None,
        "expires_at": None
    }
    logger.debug("[v0] Token cache cleared")


def get_dataverse_headers() -> dict:
    """
    Get headers for Dataverse API requests
    
    Returns:
        Dictionary with authorization headers
    """
    access_token = get_access_token()
    
    return {
        "Authorization": f"Bearer {access_token}",
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }


def validate_dataverse_connection() -> bool:
    """
    Validate connection to Dataverse
    
    Returns:
        True if connection is valid, False otherwise
    """
    try:
        org_url = os.getenv("DATAVERSE_ORG_URL")
        if not org_url:
            logger.error("[v0] DATAVERSE_ORG_URL not set")
            return False
        
        headers = get_dataverse_headers()
        response = requests.get(
            f"{org_url}/api/data/v9.2/WhoAmI",
            headers=headers
        )
        response.raise_for_status()
        
        logger.info("[v0] Dataverse connection validated successfully")
        return True
    
    except Exception as e:
        logger.error(f"[v0] Dataverse connection validation failed: {str(e)}")
        return False
