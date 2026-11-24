#!/usr/bin/env python
import sys
import os
import json
import requests
import argparse

def main():
    """
    A script to test the locally running app with proper Salesforce client context headers.
    """
    parser = argparse.ArgumentParser(description="Invoke a local API endpoint with Salesforce context.")
    parser.add_argument("org_domain", help="Your Salesforce org domain (e.g., mycompany.my.salesforce.com)")
    parser.add_argument("access_token", help="Valid Salesforce access token")
    parser.add_argument("org_id", help="Salesforce organization ID (15 or 18 characters)")
    parser.add_argument("user_id", help="Salesforce user ID (15 or 18 characters)")
    parser.add_argument("method", nargs="?", default="GET", help="HTTP method (default: GET)")
    parser.add_argument("api_path", nargs="?", default="/health", help="API endpoint path (default: /health)")
    parser.add_argument("--data", help="JSON data for POST/PUT requests")

    args = parser.parse_args()

    port = os.environ.get("PORT", "8000")
    url = f"http://localhost:{port}{args.api_path}"

    headers = {
        "Content-Type": "application/json",
        "Salesforce-Functions-Org-Domain-Url": args.org_domain,
        "Salesforce-Functions-Access-Token": args.access_token,
        "Salesforce-Functions-Org-Id": args.org_id,
        "Salesforce-Functions-User-Id": args.user_id,
    }

    try:
        if args.method.upper() in ["POST", "PUT"] and args.data:
            response = requests.request(
                args.method,
                url,
                headers=headers,
                data=args.data
            )
        else:
            response = requests.request(
                args.method,
                url,
                headers=headers
            )
        
        response.raise_for_status()
        print(response.json())

    except requests.exceptions.RequestException as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
