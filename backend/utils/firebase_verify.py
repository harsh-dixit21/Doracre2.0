import firebase_admin
from firebase_admin import credentials, auth

# Initialize Firebase Admin (add your service account JSON)
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)

def verify_firebase_token(id_token):
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token['uid']
    except:
        return None
