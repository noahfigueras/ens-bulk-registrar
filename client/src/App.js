import './App.css';
import Navbar from './components/Navbar.js';
import React, { useState } from 'react';

function App() {
	const [provider, setProvider] = useState(null);
	return (
		<div className="App">
			<Navbar Provider={provider} setProvider={setProvider}/>
		
		</div>
	);
}

export default App;
