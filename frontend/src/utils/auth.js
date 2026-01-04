import { 
  auth,
  signOut,
  onAuthStateChanged,
} from '../config/firebase'

export const verifyToken = () => {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      resolve(!!user)
    })
  })
}

export const getCurrentUser = () => {
  return auth.currentUser
}

export const getUserToken = async () => {
  const user = auth.currentUser
  if (!user) return null
  return await user.getIdToken()
}

export const logout = async () => {
  try {
    await signOut(auth)
    localStorage.removeItem('user')
    window.location.href = '/login'
  } catch (err) {
    console.error('Logout error:', err)
  }
}

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback)
}
