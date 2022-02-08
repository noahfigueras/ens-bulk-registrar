import './App.css';
import Navbar from './components/Navbar';
import Main from './components/Main';
import React, { useState } from 'react';

function App() {
	const [provider, setProvider] = useState(null);
	return (
		<div className="App">
			<Navbar Provider={provider} setProvider={setProvider}/>
			<Main Provider={provider} />	
		</div>
	);
}

export default App;
