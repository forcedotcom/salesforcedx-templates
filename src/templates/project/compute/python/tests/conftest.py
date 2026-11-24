import sys
import pytest
from unittest.mock import MagicMock, AsyncMock
from fastapi.testclient import TestClient

# Create a mock object that will act as our fake 'heroku_applink' module
mock_sdk = MagicMock()

# Define a dummy middleware class that has the same structure as the real one.
class DummyIntegrationAsgiMiddleware:
    def __init__(self, app, config=None):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        await self.app(scope, receive, send)

# Attach the DUMMY class to our FAKE module.
mock_sdk.IntegrationAsgiMiddleware = DummyIntegrationAsgiMiddleware

# Now, put the fake module in place.
sys.modules['heroku_applink'] = mock_sdk

def pytest_configure(config):
    """
    This function is called by pytest during startup.
    It programmatically disables the 'anyio' plugin, which
    conflicts with the 'pytest-asyncio' plugin we need.
    """
    config.addinivalue_line("markers", "asyncio: mark a test as being asyncio-driven.")
    if "anyio" in config.pluginmanager.list_name_plugin():
        config.pluginmanager.unregister(name="anyio")

@pytest.fixture
def client(monkeypatch):
    """
    This is the master fixture that all tests will use.
    """
    import heroku_applink as sdk

    mock_context = MagicMock()
    mock_context.data_api = AsyncMock()
    mock_context.org = AsyncMock()
    mock_context.org.data_api = mock_context.data_api
    mock_context.logger = MagicMock()
    mock_context.data_cloud = MagicMock()
    mock_context.addons.applink = AsyncMock()

    monkeypatch.setattr(sdk, "get_client_context", lambda: mock_context)
    
    from app.main import app
    
    with TestClient(app) as c:
        yield c
