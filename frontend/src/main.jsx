import { StrictMode } from 'react' // -> renders the app comonent twice to check for any errors
import { createRoot } from 'react-dom/client'
import './index.css'
import 'remixicon/fonts/remixicon.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(

    <App />

)
