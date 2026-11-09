import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  type Auth,
  type UserCredential,
} from 'firebase/auth'
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  type FirebaseStorage,
} from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyAqh2JqvVcySAWr-gfBISRYpfo64MKnKW4',
  authDomain: 'bekasku-e1979.firebaseapp.com',
  projectId: 'bekasku-e1979',
  storageBucket: 'bekasku-e1979.appspot.com',
  messagingSenderId: '729945552103',
  appId: '1:729945552103:web:dcf1daa202eebc77169e42',
  measurementId: 'G-QEED7HX56F',
}

let app: FirebaseApp | null = null
let auth: Auth | null = null
let storage: FirebaseStorage | null = null

export function useFirebase() {
  if (import.meta.client) {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig)
    } else {
      app = getApps()[0]
    }
    if (!auth) {
      auth = getAuth(app)
    }
    if (!storage) {
      storage = getStorage(app)
    }
  }

  async function uploadFileToStorage(
    path: string,
    file: Blob | File,
    onProgress?: (progressFraction: number) => void
  ): Promise<string> {
    if (!import.meta.client || !storage) {
      throw new Error('Firebase Storage tidak tersedia di server-side')
    }
    const fileRef = storageRef(storage, path)
    const uploadTask = uploadBytesResumable(fileRef, file)

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (snapshot.totalBytes > 0 && onProgress) {
            const fraction = snapshot.bytesTransferred / snapshot.totalBytes
            onProgress(fraction)
          }
        },
        (error) => {
          reject(error)
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref)
            resolve(downloadUrl)
          } catch (err) {
            reject(err)
          }
        }
      )
    })
  }

  async function signInWithGoogle(): Promise<{ idToken: string; accessToken?: string; email: string; name: string } | null> {
    if (!import.meta.client || !auth) return null
    const provider = new GoogleAuthProvider()
    provider.addScope('email')
    provider.addScope('profile')
    provider.setCustomParameters({ prompt: 'select_account' })

    const result: UserCredential = await signInWithPopup(auth, provider)
    const credential = GoogleAuthProvider.credentialFromResult(result)
    const idToken = credential?.idToken || (await result.user.getIdToken())
    const accessToken = credential?.accessToken

    return {
      idToken,
      accessToken,
      email: result.user.email || '',
      name: result.user.displayName || '',
    }
  }

  async function signInWithApple(): Promise<{ idToken: string; email: string; name: string } | null> {
    if (!import.meta.client || !auth) return null
    const provider = new OAuthProvider('apple.com')
    provider.addScope('email')
    provider.addScope('name')

    const result: UserCredential = await signInWithPopup(auth, provider)
    const credential = OAuthProvider.credentialFromResult(result)
    const idToken = credential?.idToken || (await result.user.getIdToken())
    return {
      idToken,
      email: result.user.email || '',
      name: result.user.displayName || '',
    }
  }

  return {
    auth,
    storage,
    uploadFileToStorage,
    signInWithGoogle,
    signInWithApple,
  }
}

