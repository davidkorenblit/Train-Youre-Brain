#!/usr/bin/env python3
"""
Generate buggy.py and golden_bug.json for all 10 Level 3 exercises (Real-World Backend).
Each file has exactly ONE severe real-world backend bug injected (SQLi, IDOR, Event Loop Blocking,
Connection Leaks, Hardcoded Secrets, JWT bypass, Missing Transactions).
Validates all buggy code using ast.parse().
"""

import ast
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent / "dataset" / "Level_3_Real_World"

EXERCISES_DATA = {
    "jwt_auth_service": {
        "buggy_code": (
            "from datetime import datetime, timedelta\n"
            "from typing import Dict\n"
            "\n"
            "import jwt\n"
            "from pydantic import ValidationError\n"
            "\n"
            "from app.models.domain.users import User\n"
            "from app.models.schemas.jwt import JWTMeta, JWTUser\n"
            "\n"
            'JWT_SUBJECT = "access"\n'
            'ALGORITHM = "HS256"\n'
            "ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # one week\n"
            "\n"
            "\n"
            "def create_jwt_token(\n"
            "    *,\n"
            "    jwt_content: Dict[str, str],\n"
            "    secret_key: str,\n"
            "    expires_delta: timedelta,\n"
            ") -> str:\n"
            "    to_encode = jwt_content.copy()\n"
            "    expire = datetime.utcnow() + expires_delta\n"
            "    to_encode.update(JWTMeta(exp=expire, sub=JWT_SUBJECT).dict())\n"
            "    return jwt.encode(to_encode, secret_key, algorithm=ALGORITHM)\n"
            "\n"
            "\n"
            "def create_access_token_for_user(user: User, secret_key: str) -> str:\n"
            "    return create_jwt_token(\n"
            "        jwt_content=JWTUser(username=user.username).dict(),\n"
            "        secret_key=secret_key,\n"
            "        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),\n"
            "    )\n"
            "\n"
            "\n"
            "def get_username_from_token(token: str, secret_key: str) -> str:\n"
            "    try:\n"
            "        return JWTUser(\n"
            '            **jwt.decode(token, secret_key, algorithms=[ALGORITHM], options={"verify_signature": False})\n'
            "        ).username\n"
            "    except jwt.PyJWTError as decode_error:\n"
            '        raise ValueError("unable to decode JWT token") from decode_error\n'
            "    except ValidationError as validation_error:\n"
            '        raise ValueError("malformed payload in token") from validation_error\n'
        ),
        "golden_bug": {
            "line_number": 39,
            "severity": "Critical",
            "bug_description": "Disabled JWT signature verification: `options={'verify_signature': False}` instructs the JWT decoder to skip cryptographic signature checks. Attackers can forge arbitrary tokens containing any username (e.g. admin accounts) without possessing the secret key.",
            "suggested_fix": "Remove `options={'verify_signature': False}` to ensure that `jwt.decode` enforces cryptographic signature verification using `secret_key`."
        }
    },
    "app_configuration": {
        "buggy_code": (
            "import logging\n"
            "import sys\n"
            "from typing import Any, Dict, List, Tuple\n"
            "\n"
            "from loguru import logger\n"
            "from pydantic import PostgresDsn, SecretStr\n"
            "\n"
            "from app.core.logging import InterceptHandler\n"
            "from app.core.settings.base import BaseAppSettings\n"
            "\n"
            "\n"
            "class AppSettings(BaseAppSettings):\n"
            "    debug: bool = False\n"
            '    docs_url: str = "/docs"\n'
            '    openapi_prefix: str = ""\n'
            '    openapi_url: str = "/openapi.json"\n'
            '    redoc_url: str = "/redoc"\n'
            '    title: str = "FastAPI example application"\n'
            '    version: str = "0.0.0"\n'
            "\n"
            "    database_url: PostgresDsn\n"
            "    max_connection_count: int = 10\n"
            "    min_connection_count: int = 10\n"
            "\n"
            '    secret_key: SecretStr = SecretStr("insecure-hardcoded-secret-key-123456789")\n'
            "\n"
            '    api_prefix: str = "/api"\n'
            "\n"
            '    jwt_token_prefix: str = "Token"\n'
            "\n"
            '    allowed_hosts: List[str] = ["*"]\n'
            "\n"
            "    logging_level: int = logging.INFO\n"
            '    loggers: Tuple[str, str] = ("uvicorn.asgi", "uvicorn.access")\n'
            "\n"
            "    class Config:\n"
            "        validate_assignment = True\n"
            "\n"
            "    @property\n"
            "    def fastapi_kwargs(self) -> Dict[str, Any]:\n"
            "        return {\n"
            '            "debug": self.debug,\n'
            '            "docs_url": self.docs_url,\n'
            '            "openapi_prefix": self.openapi_prefix,\n'
            '            "openapi_url": self.openapi_url,\n'
            '            "redoc_url": self.redoc_url,\n'
            '            "title": self.title,\n'
            '            "version": self.version,\n'
            "        }\n"
            "\n"
            "    def configure_logging(self) -> None:\n"
            "        logging.getLogger().handlers = [InterceptHandler()]\n"
            "        for logger_name in self.loggers:\n"
            "            logging_logger = logging.getLogger(logger_name)\n"
            "            logging_logger.handlers = [InterceptHandler(level=self.logging_level)]\n"
            "\n"
            '        logger.configure(handlers=[{"sink": sys.stderr, "level": self.logging_level}])\n'
        ),
        "golden_bug": {
            "line_number": 25,
            "severity": "Critical",
            "bug_description": "Hardcoded cryptographic secret key: `secret_key: SecretStr = SecretStr('insecure-hardcoded-secret-key-123456789')` sets a default secret key in code. If the environment variable is not supplied in production, the application silently defaults to this known public string, allowing anyone to sign valid authentication tokens.",
            "suggested_fix": "Declare `secret_key: SecretStr` without a default value so Pydantic enforces that `SECRET_KEY` must be provided via environment variables or secret manager."
        }
    },
    "http_error_handlers": {
        "buggy_code": (
            "import time\n"
            "from fastapi import HTTPException\n"
            "from starlette.requests import Request\n"
            "from starlette.responses import JSONResponse\n"
            "\n"
            "\n"
            "async def http_error_handler(_: Request, exc: HTTPException) -> JSONResponse:\n"
            "    time.sleep(1.0)  # Synchronous blocking sleep in async error handler\n"
            '    return JSONResponse({"errors": [exc.detail]}, status_code=exc.status_code)\n'
        ),
        "golden_bug": {
            "line_number": 8,
            "severity": "High",
            "bug_description": "Blocking the asyncio event loop: `time.sleep(1.0)` is a synchronous, blocking system call executed inside an `async def` handler. Whenever an error occurs, it blocks the single-threaded asyncio event loop for 1.0 second, freezing all concurrent requests from all users.",
            "suggested_fix": "Use non-blocking asynchronous sleep: `await asyncio.sleep(1.0)` (or remove the sleep entirely)."
        }
    },
    "auth_dependency": {
        "buggy_code": (
            "# noqa:WPS201\n"
            "from typing import Callable, Optional\n"
            "\n"
            "from fastapi import Depends, HTTPException, Security\n"
            "from fastapi.security import APIKeyHeader\n"
            "from starlette import requests, status\n"
            "from starlette.exceptions import HTTPException as StarletteHTTPException\n"
            "\n"
            "from app.api.dependencies.database import get_repository\n"
            "from app.core.config import get_app_settings\n"
            "from app.core.settings.app import AppSettings\n"
            "from app.db.errors import EntityDoesNotExist\n"
            "from app.db.repositories.users import UsersRepository\n"
            "from app.models.domain.users import User\n"
            "from app.resources import strings\n"
            "from app.services import jwt\n"
            "\n"
            'HEADER_KEY = "Authorization"\n'
            "\n"
            "\n"
            "class RWAPIKeyHeader(APIKeyHeader):\n"
            "    async def __call__(  # noqa: WPS610\n"
            "        self,\n"
            "        request: requests.Request,\n"
            "    ) -> Optional[str]:\n"
            "        try:\n"
            "            return await super().__call__(request)\n"
            "        except StarletteHTTPException as original_auth_exc:\n"
            "            raise HTTPException(\n"
            "                status_code=original_auth_exc.status_code,\n"
            "                detail=strings.AUTHENTICATION_REQUIRED,\n"
            "            )\n"
            "\n"
            "\n"
            "def get_current_user_authorizer(*, required: bool = True) -> Callable:  # type: ignore\n"
            "    return _get_current_user if required else _get_current_user_optional\n"
            "\n"
            "\n"
            "def _get_authorization_header_retriever(\n"
            "    *,\n"
            "    required: bool = True,\n"
            ") -> Callable:  # type: ignore\n"
            "    return _get_authorization_header if required else _get_authorization_header_optional\n"
            "\n"
            "\n"
            "def _get_authorization_header(\n"
            "    api_key: str = Security(RWAPIKeyHeader(name=HEADER_KEY)),\n"
            "    settings: AppSettings = Depends(get_app_settings),\n"
            ") -> str:\n"
            "    try:\n"
            '        token_prefix, token = api_key.split(" ")\n'
            "    except ValueError:\n"
            "        raise HTTPException(\n"
            "            status_code=status.HTTP_403_FORBIDDEN,\n"
            "            detail=strings.WRONG_TOKEN_PREFIX,\n"
            "        )\n"
            "    if token_prefix != settings.jwt_token_prefix:\n"
            "        raise HTTPException(\n"
            "            status_code=status.HTTP_403_FORBIDDEN,\n"
            "            detail=strings.WRONG_TOKEN_PREFIX,\n"
            "        )\n"
            "\n"
            "    return token\n"
            "\n"
            "\n"
            "def _get_authorization_header_optional(\n"
            "    authorization: Optional[str] = Security(\n"
            "        RWAPIKeyHeader(name=HEADER_KEY, auto_error=False),\n"
            "    ),\n"
            "    settings: AppSettings = Depends(get_app_settings),\n"
            ") -> str:\n"
            "    if authorization:\n"
            "        return _get_authorization_header(authorization, settings)\n"
            "\n"
            '    return ""\n'
            "\n"
            "\n"
            "async def _get_current_user(\n"
            "    users_repo: UsersRepository = Depends(get_repository(UsersRepository)),\n"
            "    token: str = Depends(_get_authorization_header_retriever()),\n"
            "    settings: AppSettings = Depends(get_app_settings),\n"
            ") -> User:\n"
            "    try:\n"
            "        username = jwt.get_username_from_token(\n"
            "            token,\n"
            "            str(settings.secret_key.get_secret_value()),\n"
            "        )\n"
            "    except ValueError:\n"
            "        raise HTTPException(\n"
            "            status_code=status.HTTP_403_FORBIDDEN,\n"
            "            detail=strings.MALFORMED_PAYLOAD,\n"
            "        )\n"
            "\n"
            "    try:\n"
            "        return users_repo.get_user_by_username(username=username)  # Missing await on async DB call\n"
            "    except EntityDoesNotExist:\n"
            "        raise HTTPException(\n"
            "            status_code=status.HTTP_403_FORBIDDEN,\n"
            "            detail=strings.MALFORMED_PAYLOAD,\n"
            "        )\n"
            "\n"
            "\n"
            "async def _get_current_user_optional(\n"
            "    repo: UsersRepository = Depends(get_repository(UsersRepository)),\n"
            "    token: str = Depends(_get_authorization_header_retriever(required=False)),\n"
            "    settings: AppSettings = Depends(get_app_settings),\n"
            ") -> Optional[User]:\n"
            "    if token:\n"
            "        return await _get_current_user(repo, token, settings)\n"
            "\n"
            "    return None\n"
        ),
        "golden_bug": {
            "line_number": 95,
            "severity": "High",
            "bug_description": "Missing `await` keyword on asynchronous database call: `return users_repo.get_user_by_username(username=username)` returns a raw coroutine object rather than awaiting the `User` record. This causes a `RuntimeWarning: coroutine was never awaited` and crashes downstream endpoints expecting a `User` instance.",
            "suggested_fix": "Add the `await` keyword: `return await users_repo.get_user_by_username(username=username)`."
        }
    },
    "database_dependency": {
        "buggy_code": (
            "from typing import AsyncGenerator, Callable, Type\n"
            "\n"
            "from asyncpg.connection import Connection\n"
            "from asyncpg.pool import Pool\n"
            "from fastapi import Depends\n"
            "from starlette.requests import Request\n"
            "\n"
            "from app.db.repositories.base import BaseRepository\n"
            "\n"
            "\n"
            "def _get_db_pool(request: Request) -> Pool:\n"
            "    return request.app.state.pool\n"
            "\n"
            "\n"
            "async def _get_connection_from_pool(\n"
            "    pool: Pool = Depends(_get_db_pool),\n"
            ") -> AsyncGenerator[Connection, None]:\n"
            "    conn = await pool.acquire()  # Acquired directly without context manager\n"
            "    yield conn\n"
            "    # Missing pool.release(conn) or 'async with' context manager\n"
            "\n"
            "\n"
            "def get_repository(\n"
            "    repo_type: Type[BaseRepository],\n"
            ") -> Callable[[Connection], BaseRepository]:\n"
            "    def _get_repo(\n"
            "        conn: Connection = Depends(_get_connection_from_pool),\n"
            "    ) -> BaseRepository:\n"
            "        return repo_type(conn)\n"
            "\n"
            "    return _get_repo\n"
        ),
        "golden_bug": {
            "line_number": 18,
            "severity": "Critical",
            "bug_description": "Database connection pool exhaustion / Connection leak: Calling `conn = await pool.acquire()` without an `async with` block or `finally: await pool.release(conn)` fails to return database connections to the pool after HTTP requests finish. Under moderate production traffic, all available pool connections are quickly exhausted, causing all database queries to hang indefinitely.",
            "suggested_fix": "Wrap the connection acquisition in an async context manager: `async with pool.acquire() as conn: yield conn`."
        }
    },
    "auth_routes": {
        "buggy_code": (
            "import time\n"
            "from fastapi import APIRouter, Body, Depends, HTTPException\n"
            "from starlette.status import HTTP_201_CREATED, HTTP_400_BAD_REQUEST\n"
            "\n"
            "from app.api.dependencies.database import get_repository\n"
            "from app.core.config import get_app_settings\n"
            "from app.core.settings.app import AppSettings\n"
            "from app.db.errors import EntityDoesNotExist\n"
            "from app.db.repositories.users import UsersRepository\n"
            "from app.models.schemas.users import (\n"
            "    UserInCreate,\n"
            "    UserInLogin,\n"
            "    UserInResponse,\n"
            "    UserWithToken,\n"
            ")\n"
            "from app.resources import strings\n"
            "from app.services import jwt\n"
            "from app.services.authentication import check_email_is_taken, check_username_is_taken\n"
            "\n"
            "router = APIRouter()\n"
            "\n"
            "\n"
            '@router.post("/login", response_model=UserInResponse, name="auth:login")\n'
            "async def login(\n"
            '    user_login: UserInLogin = Body(..., embed=True, alias="user"),\n'
            "    users_repo: UsersRepository = Depends(get_repository(UsersRepository)),\n"
            "    settings: AppSettings = Depends(get_app_settings),\n"
            ") -> UserInResponse:\n"
            "    time.sleep(1.0)  # Blocking synchronous sleep halting event loop\n"
            "    wrong_login_error = HTTPException(\n"
            "        status_code=HTTP_400_BAD_REQUEST,\n"
            "        detail=strings.INCORRECT_LOGIN_INPUT,\n"
            "    )\n"
            "\n"
            "    try:\n"
            "        user = await users_repo.get_user_by_email(email=user_login.email)\n"
            "    except EntityDoesNotExist as existence_error:\n"
            "        raise wrong_login_error from existence_error\n"
            "\n"
            "    if not user.check_password(user_login.password):\n"
            "        raise wrong_login_error\n"
            "\n"
            "    token = jwt.create_access_token_for_user(\n"
            "        user,\n"
            "        str(settings.secret_key.get_secret_value()),\n"
            "    )\n"
            "    return UserInResponse(\n"
            "        user=UserWithToken(\n"
            "            username=user.username,\n"
            "            email=user.email,\n"
            "            bio=user.bio,\n"
            "            image=user.image,\n"
            "            token=token,\n"
            "        ),\n"
            "    )\n"
            "\n"
            "\n"
            "@router.post(\n"
            '    "",\n'
            "    status_code=HTTP_201_CREATED,\n"
            "    response_model=UserInResponse,\n"
            '    name="auth:register",\n'
            ")\n"
            "async def register(\n"
            '    user_create: UserInCreate = Body(..., embed=True, alias="user"),\n'
            "    users_repo: UsersRepository = Depends(get_repository(UsersRepository)),\n"
            "    settings: AppSettings = Depends(get_app_settings),\n"
            ") -> UserInResponse:\n"
            "    if await check_username_is_taken(users_repo, user_create.username):\n"
            "        raise HTTPException(\n"
            "            status_code=HTTP_400_BAD_REQUEST,\n"
            "            detail=strings.USERNAME_TAKEN,\n"
            "        )\n"
            "\n"
            "    if await check_email_is_taken(users_repo, user_create.email):\n"
            "        raise HTTPException(\n"
            "            status_code=HTTP_400_BAD_REQUEST,\n"
            "            detail=strings.EMAIL_TAKEN,\n"
            "        )\n"
            "\n"
            "    user = await users_repo.create_user(**user_create.dict())\n"
            "\n"
            "    token = jwt.create_access_token_for_user(\n"
            "        user,\n"
            "        str(settings.secret_key.get_secret_value()),\n"
            "    )\n"
            "    return UserInResponse(\n"
            "        user=UserWithToken(\n"
            "            username=user.username,\n"
            "            email=user.email,\n"
            "            bio=user.bio,\n"
            "            image=user.image,\n"
            "            token=token,\n"
            "        ),\n"
            "    )\n"
        ),
        "golden_bug": {
            "line_number": 29,
            "severity": "High",
            "bug_description": "Blocking the asyncio event loop: `time.sleep(1.0)` is synchronously invoked inside the async `login` route handler (often naively introduced as an anti-brute-force throttle). Because FastAPI runs async endpoints on the main event loop thread, this blocks all server operations and queued requests for 1 full second.",
            "suggested_fix": "Use non-blocking asynchronous sleep: `await asyncio.sleep(1.0)`, or implement dedicated Redis-based token-bucket rate limiting."
        }
    },
    "user_profile_routes": {
        "buggy_code": (
            "from typing import Optional\n"
            "from fastapi import APIRouter, Body, Depends, HTTPException\n"
            "from starlette.status import HTTP_400_BAD_REQUEST\n"
            "\n"
            "from app.api.dependencies.authentication import get_current_user_authorizer\n"
            "from app.api.dependencies.database import get_repository\n"
            "from app.core.config import get_app_settings\n"
            "from app.core.settings.app import AppSettings\n"
            "from app.db.repositories.users import UsersRepository\n"
            "from app.models.domain.users import User\n"
            "from app.models.schemas.users import UserInResponse, UserInUpdate, UserWithToken\n"
            "from app.resources import strings\n"
            "from app.services import jwt\n"
            "from app.services.authentication import check_email_is_taken, check_username_is_taken\n"
            "\n"
            "router = APIRouter()\n"
            "\n"
            "\n"
            '@router.get("", response_model=UserInResponse, name="users:get-current-user")\n'
            "async def retrieve_current_user(\n"
            "    user: User = Depends(get_current_user_authorizer()),\n"
            "    settings: AppSettings = Depends(get_app_settings),\n"
            ") -> UserInResponse:\n"
            "    token = jwt.create_access_token_for_user(\n"
            "        user,\n"
            "        str(settings.secret_key.get_secret_value()),\n"
            "    )\n"
            "    return UserInResponse(\n"
            "        user=UserWithToken(\n"
            "            username=user.username,\n"
            "            email=user.email,\n"
            "            bio=user.bio,\n"
            "            image=user.image,\n"
            "            token=token,\n"
            "        ),\n"
            "    )\n"
            "\n"
            "\n"
            '@router.put("", response_model=UserInResponse, name="users:update-current-user")\n'
            "async def update_current_user(\n"
            '    user_update: UserInUpdate = Body(..., embed=True, alias="user"),\n'
            "    target_username: Optional[str] = None,  # Insecure parameter allowing arbitrary user updates\n"
            "    current_user: User = Depends(get_current_user_authorizer()),\n"
            "    users_repo: UsersRepository = Depends(get_repository(UsersRepository)),\n"
            "    settings: AppSettings = Depends(get_app_settings),\n"
            ") -> UserInResponse:\n"
            "    target_user = (\n"
            "        await users_repo.get_user_by_username(username=target_username)\n"
            "        if target_username\n"
            "        else current_user\n"
            "    )\n"
            "\n"
            "    if user_update.username and user_update.username != target_user.username:\n"
            "        if await check_username_is_taken(users_repo, user_update.username):\n"
            "            raise HTTPException(\n"
            "                status_code=HTTP_400_BAD_REQUEST,\n"
            "                detail=strings.USERNAME_TAKEN,\n"
            "            )\n"
            "\n"
            "    if user_update.email and user_update.email != target_user.email:\n"
            "        if await check_email_is_taken(users_repo, user_update.email):\n"
            "            raise HTTPException(\n"
            "                status_code=HTTP_400_BAD_REQUEST,\n"
            "                detail=strings.EMAIL_TAKEN,\n"
            "            )\n"
            "\n"
            "    user = await users_repo.update_user(user=target_user, **user_update.dict())\n"
            "\n"
            "    token = jwt.create_access_token_for_user(\n"
            "        user,\n"
            "        str(settings.secret_key.get_secret_value()),\n"
            "    )\n"
            "    return UserInResponse(\n"
            "        user=UserWithToken(\n"
            "            username=user.username,\n"
            "            email=user.email,\n"
            "            bio=user.bio,\n"
            "            image=user.image,\n"
            "            token=token,\n"
            "        ),\n"
            "    )\n"
        ),
        "golden_bug": {
            "line_number": 42,
            "severity": "Critical",
            "bug_description": "Broken Object Level Authorization (BOLA / IDOR): Accepting `target_username: Optional[str] = None` and updating `target_user` instead of strictly enforcing `current_user` allows any authenticated user to modify any other user's account details (including passwords and emails) simply by passing their username.",
            "suggested_fix": "Remove `target_username` parameter completely and ensure that `update_user` is strictly executed on `current_user`."
        }
    },
    "articles_crud_routes": {
        "buggy_code": (
            "from typing import Optional\n"
            "\n"
            "from fastapi import APIRouter, Body, Depends, HTTPException, Response\n"
            "from starlette import status\n"
            "\n"
            "from app.api.dependencies.articles import (\n"
            "    check_article_modification_permissions,\n"
            "    get_article_by_slug_from_path,\n"
            "    get_articles_filters,\n"
            ")\n"
            "from app.api.dependencies.authentication import get_current_user_authorizer\n"
            "from app.api.dependencies.database import get_repository\n"
            "from app.db.repositories.articles import ArticlesRepository\n"
            "from app.models.domain.articles import Article\n"
            "from app.models.domain.users import User\n"
            "from app.models.schemas.articles import (\n"
            "    ArticleForResponse,\n"
            "    ArticleInCreate,\n"
            "    ArticleInResponse,\n"
            "    ArticleInUpdate,\n"
            "    ArticlesFilters,\n"
            "    ListOfArticlesInResponse,\n"
            ")\n"
            "from app.resources import strings\n"
            "from app.services.articles import check_article_exists, get_slug_for_article\n"
            "\n"
            "router = APIRouter()\n"
            "\n"
            "\n"
            '@router.get("", response_model=ListOfArticlesInResponse, name="articles:list-articles")\n'
            "async def list_articles(\n"
            "    articles_filters: ArticlesFilters = Depends(get_articles_filters),\n"
            "    user: Optional[User] = Depends(get_current_user_authorizer(required=False)),\n"
            "    articles_repo: ArticlesRepository = Depends(get_repository(ArticlesRepository)),\n"
            ") -> ListOfArticlesInResponse:\n"
            "    articles = await articles_repo.filter_articles(\n"
            "        tag=articles_filters.tag,\n"
            "        author=articles_filters.author,\n"
            "        favorited=articles_filters.favorited,\n"
            "        limit=articles_filters.limit,\n"
            "        offset=articles_filters.offset,\n"
            "        requested_user=user,\n"
            "    )\n"
            "    articles_for_response = [\n"
            "        ArticleForResponse.from_orm(article) for article in articles\n"
            "    ]\n"
            "    return ListOfArticlesInResponse(\n"
            "        articles=articles_for_response,\n"
            "        articles_count=len(articles),\n"
            "    )\n"
            "\n"
            "\n"
            "@router.post(\n"
            '    "",\n'
            "    status_code=status.HTTP_201_CREATED,\n"
            "    response_model=ArticleInResponse,\n"
            '    name="articles:create-article",\n'
            ")\n"
            "async def create_new_article(\n"
            '    article_create: ArticleInCreate = Body(..., embed=True, alias="article"),\n'
            "    user: User = Depends(get_current_user_authorizer()),\n"
            "    articles_repo: ArticlesRepository = Depends(get_repository(ArticlesRepository)),\n"
            ") -> ArticleInResponse:\n"
            "    slug = get_slug_for_article(article_create.title)\n"
            "    if await check_article_exists(articles_repo, slug):\n"
            "        raise HTTPException(\n"
            "            status_code=status.HTTP_400_BAD_REQUEST,\n"
            "            detail=strings.ARTICLE_ALREADY_EXISTS,\n"
            "        )\n"
            "\n"
            "    article = await articles_repo.create_article(\n"
            "        slug=slug,\n"
            "        title=article_create.title,\n"
            "        description=article_create.description,\n"
            "        body=article_create.body,\n"
            "        author=user,\n"
            "        tags=article_create.tags,\n"
            "    )\n"
            "    return ArticleInResponse(article=ArticleForResponse.from_orm(article))\n"
            "\n"
            "\n"
            '@router.get("/{slug}", response_model=ArticleInResponse, name="articles:get-article")\n'
            "async def retrieve_article_by_slug(\n"
            "    article: Article = Depends(get_article_by_slug_from_path),\n"
            ") -> ArticleInResponse:\n"
            "    return ArticleInResponse(article=ArticleForResponse.from_orm(article))\n"
            "\n"
            "\n"
            "@router.put(\n"
            '    "/{slug}",\n'
            "    response_model=ArticleInResponse,\n"
            '    name="articles:update-article",\n'
            "    dependencies=[Depends(check_article_modification_permissions)],\n"
            ")\n"
            "async def update_article_by_slug(\n"
            '    article_update: ArticleInUpdate = Body(..., embed=True, alias="article"),\n'
            "    current_article: Article = Depends(get_article_by_slug_from_path),\n"
            "    articles_repo: ArticlesRepository = Depends(get_repository(ArticlesRepository)),\n"
            ") -> ArticleInResponse:\n"
            "    slug = get_slug_for_article(article_update.title) if article_update.title else None\n"
            "    article = await articles_repo.update_article(\n"
            "        article=current_article,\n"
            "        slug=slug,\n"
            "        **article_update.dict(),\n"
            "    )\n"
            "    return ArticleInResponse(article=ArticleForResponse.from_orm(article))\n"
            "\n"
            "\n"
            "@router.delete(\n"
            '    "/{slug}",\n'
            "    status_code=status.HTTP_204_NO_CONTENT,\n"
            '    name="articles:delete-article",\n'
            "    response_class=Response,\n"
            ")\n"
            "async def delete_article_by_slug(\n"
            "    article: Article = Depends(get_article_by_slug_from_path),\n"
            "    articles_repo: ArticlesRepository = Depends(get_repository(ArticlesRepository)),\n"
            ") -> None:\n"
            "    await articles_repo.delete_article(article=article)\n"
        ),
        "golden_bug": {
            "line_number": 113,
            "severity": "Critical",
            "bug_description": "Missing Authorization Check: The `@router.delete('/{slug}')` endpoint omits the security guard `dependencies=[Depends(check_article_modification_permissions)]`. Any user (including unauthenticated callers) can delete any article in the system simply by issuing a DELETE request with the article's slug.",
            "suggested_fix": "Add `dependencies=[Depends(check_article_modification_permissions)]` to the route decorator to enforce that only the original author can delete the article."
        }
    },
    "users_repository": {
        "buggy_code": (
            "from typing import Optional\n"
            "\n"
            "from app.db.errors import EntityDoesNotExist\n"
            "from app.db.queries.queries import queries\n"
            "from app.db.repositories.base import BaseRepository\n"
            "from app.models.domain.users import User, UserInDB\n"
            "\n"
            "\n"
            "class UsersRepository(BaseRepository):\n"
            "    async def get_user_by_email(self, *, email: str) -> UserInDB:\n"
            "        user_row = await queries.get_user_by_email(self.connection, email=email)\n"
            "        if user_row:\n"
            "            return UserInDB(**user_row)\n"
            "\n"
            '        raise EntityDoesNotExist("user with email {0} does not exist".format(email))\n'
            "\n"
            "    async def get_user_by_username(self, *, username: str) -> UserInDB:\n"
            '        query = f"SELECT * FROM users WHERE username = \'{username}\'"  # SQL Injection\n'
            "        user_row = await self.connection.fetchrow(query)\n"
            "        if user_row:\n"
            "            return UserInDB(**user_row)\n"
            "\n"
            "        raise EntityDoesNotExist(\n"
            '            "user with username {0} does not exist".format(username),\n'
            "        )\n"
            "\n"
            "    async def create_user(\n"
            "        self,\n"
            "        *,\n"
            "        username: str,\n"
            "        email: str,\n"
            "        password: str,\n"
            "    ) -> UserInDB:\n"
            "        user = UserInDB(username=username, email=email)\n"
            "        user.change_password(password)\n"
            "\n"
            "        async with self.connection.transaction():\n"
            "            user_row = await queries.create_new_user(\n"
            "                self.connection,\n"
            "                username=user.username,\n"
            "                email=user.email,\n"
            "                salt=user.salt,\n"
            "                hashed_password=user.hashed_password,\n"
            "            )\n"
            "\n"
            "        return user.copy(update=dict(user_row))\n"
            "\n"
            "    async def update_user(  # noqa: WPS211\n"
            "        self,\n"
            "        *,\n"
            "        user: User,\n"
            "        username: Optional[str] = None,\n"
            "        email: Optional[str] = None,\n"
            "        password: Optional[str] = None,\n"
            "        bio: Optional[str] = None,\n"
            "        image: Optional[str] = None,\n"
            "    ) -> UserInDB:\n"
            "        user_in_db = await self.get_user_by_username(username=user.username)\n"
            "\n"
            "        user_in_db.username = username or user_in_db.username\n"
            "        user_in_db.email = email or user_in_db.email\n"
            "        user_in_db.bio = bio or user_in_db.bio\n"
            "        user_in_db.image = image or user_in_db.image\n"
            "        if password:\n"
            "            user_in_db.change_password(password)\n"
            "\n"
            "        async with self.connection.transaction():\n"
            "            user_in_db.updated_at = await queries.update_user_by_username(\n"
            "                self.connection,\n"
            "                username=user.username,\n"
            "                new_username=user_in_db.username,\n"
            "                new_email=user_in_db.email,\n"
            "                new_salt=user_in_db.salt,\n"
            "                new_password=user_in_db.hashed_password,\n"
            "                new_bio=user_in_db.bio,\n"
            "                new_image=user_in_db.image,\n"
            "            )\n"
            "\n"
            "        return user_in_db\n"
        ),
        "golden_bug": {
            "line_number": 18,
            "severity": "Critical",
            "bug_description": "SQL Injection: `get_user_by_username` formats user-controlled input directly into a raw SQL query string (`f\"SELECT * FROM users WHERE username = '{username}'\"`) and passes it to `connection.fetchrow`. An attacker can inject SQL syntax (e.g. `' OR '1'='1`) to extract unauthorized user records or bypass authentication.",
            "suggested_fix": "Use parameterized queries with placeholders: `await self.connection.fetchrow('SELECT * FROM users WHERE username = $1', username)`."
        }
    },
    "articles_repository": {
        "buggy_code": (
            "from typing import List, Optional, Sequence, Union\n"
            "\n"
            "from asyncpg import Connection, Record\n"
            "from pypika import Query\n"
            "\n"
            "from app.db.errors import EntityDoesNotExist\n"
            "from app.db.queries.queries import queries\n"
            "from app.db.queries.tables import (\n"
            "    Parameter,\n"
            "    articles,\n"
            "    articles_to_tags,\n"
            "    favorites,\n"
            "    tags as tags_table,\n"
            "    users,\n"
            ")\n"
            "from app.db.repositories.base import BaseRepository\n"
            "from app.db.repositories.profiles import ProfilesRepository\n"
            "from app.db.repositories.tags import TagsRepository\n"
            "from app.models.domain.articles import Article\n"
            "from app.models.domain.users import User\n"
            "\n"
            'AUTHOR_USERNAME_ALIAS = "author_username"\n'
            'SLUG_ALIAS = "slug"\n'
            "\n"
            'CAMEL_OR_SNAKE_CASE_TO_WORDS = r"^[a-z\\d_\\-]+|[A-Z\\d_\\-][^A-Z\\d_\\-]*"\n'
            "\n"
            "\n"
            "class ArticlesRepository(BaseRepository):  # noqa: WPS214\n"
            "    def __init__(self, conn: Connection) -> None:\n"
            "        super().__init__(conn)\n"
            "        self._profiles_repo = ProfilesRepository(conn)\n"
            "        self._tags_repo = TagsRepository(conn)\n"
            "\n"
            "    async def create_article(  # noqa: WPS211\n"
            "        self,\n"
            "        *,\n"
            "        slug: str,\n"
            "        title: str,\n"
            "        description: str,\n"
            "        body: str,\n"
            "        author: User,\n"
            "        tags: Optional[Sequence[str]] = None,\n"
            "    ) -> Article:\n"
            "        # Missing transaction context manager: multi-step database writes are non-atomic\n"
            "        article_row = await queries.create_new_article(\n"
            "            self.connection,\n"
            "            slug=slug,\n"
            "            title=title,\n"
            "            description=description,\n"
            "            body=body,\n"
            "            author_username=author.username,\n"
            "        )\n"
            "\n"
            "        if tags:\n"
            "            await self._tags_repo.create_tags_that_dont_exist(tags=tags)\n"
            "            await self._link_article_with_tags(slug=slug, tags=tags)\n"
            "\n"
            "        return await self._get_article_from_db_record(\n"
            "            article_row=article_row,\n"
            "            slug=slug,\n"
            "            author_username=author.username,\n"
            "            requested_user=author,\n"
            "        )\n"
        ),
        "golden_bug": {
            "line_number": 43,
            "severity": "High",
            "bug_description": "Atomicity violation / Missing database transaction: `create_article` executes multiple interdependent database operations (inserting the article, creating new tags, and linking tags) without an enclosing `async with self.connection.transaction():`. If tag creation or linking fails, the article record remains committed in an orphaned, partially-written state without rollback.",
            "suggested_fix": "Wrap the article creation and tag linking operations inside `async with self.connection.transaction():` to guarantee database atomicity."
        }
    }
}


def main():
    print("=" * 65)
    print("Injecting Level 3 Real-World Backend Golden Bugs")
    print("=" * 65)

    if not BASE_DIR.exists():
        raise FileNotFoundError(f"Directory not found: {BASE_DIR}")

    success_count = 0

    for component_name, data in EXERCISES_DATA.items():
        comp_dir = BASE_DIR / component_name
        if not comp_dir.exists():
            print(f"[!] Warning: Directory {comp_dir} does not exist, creating it.")
            comp_dir.mkdir(parents=True, exist_ok=True)

        buggy_code = data["buggy_code"]
        golden_bug = data["golden_bug"]

        # 1. Validate syntax with AST
        try:
            ast.parse(buggy_code)
        except SyntaxError as e:
            print(f"[X] Syntax error in {component_name}: {e}")
            continue

        # 2. Write buggy.py
        buggy_path = comp_dir / "buggy.py"
        buggy_path.write_text(buggy_code, encoding="utf-8")

        # 3. Write golden_bug.json
        golden_path = comp_dir / "golden_bug.json"
        golden_path.write_text(json.dumps(golden_bug, indent=2, ensure_ascii=False), encoding="utf-8")

        success_count += 1
        print(f"[{success_count:02d}/10] {component_name:24} -> Line {golden_bug['line_number']:2d} [{golden_bug['severity']:8}]")

    print("=" * 65)
    print(f"Successfully processed {success_count}/10 Level 3 backend exercises.")
    print("=" * 65)


if __name__ == "__main__":
    main()
