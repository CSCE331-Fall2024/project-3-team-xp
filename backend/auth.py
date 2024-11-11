from flask import Blueprint, redirect, url_for, session, request
from authlib.integrations.flask_client import OAuth
import os
import secrets
from .models import db, User

oauth_bp = Blueprint("auth", __name__)
oauth = OAuth()


def init_oauth(app):
    oauth.init_app(app)
    oauth.register(
        name="google",
        client_id=os.getenv("CLIENT_ID"),
        client_secret=os.getenv("CLIENT_SECRET"),
        access_token_url="https://accounts.google.com/o/oauth2/token",
        access_token_params=None,
        authorize_url="https://accounts.google.com/o/oauth2/auth",
        authorize_params=None,
        api_base_url="https://www.googleapis.com/oauth2/v1/",
        client_kwargs={"scope": "profile email"},
        server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    )


@oauth_bp.route("/login")
def login():
    google = oauth.create_client("google")
    redirect_uri = url_for("auth.authorize", _external=True)
    nonce = secrets.token_urlsafe()
    session["nonce"] = nonce
    return google.authorize_redirect(redirect_uri)


@oauth_bp.route("/authorize")
def authorize():
    google = oauth.create_client("google")
    token = google.authorize_access_token()
    if token:
        user_info = google.get("userinfo").json()
        session["email"] = user_info["email"]
        session["name"] = user_info.get("name", "Unknown User")

        existing_user = User.query.filter_by(email=user_info["email"]).first()
        if not existing_user:
            account_type = user_info.get("account", "Manager")
            new_user = User(
                email=user_info["email"],
                name=user_info.get("name", "Unknown User"),
                account=account_type,
            )
            db.session.add(new_user)
            db.session.commit()
            session["account"] = account_type
        else:
            session["account"] = existing_user.account

    return redirect("http://localhost:5173/")


@oauth_bp.route("/api/user")
def get_user_info():
    user_info = {"email": session.get("email"), "name": session.get("name")}
    return user_info if user_info["email"] else {"error": "Not logged in"}, 200


@oauth_bp.route("/logout")
def logout():
    session.clear()
    return redirect("/")
