import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';

import React, { useState } from 'react';

const MyModal = (props) =>  {
	const [secret, setSecret] = useState("");
	return (
	<Modal
	  {...props}
	  size="lg"
	  aria-labelledby="contained-modal-title-vcenter"
	  centered
	>
	  <Modal.Header closeButton>
		<Modal.Title id="contained-modal-title-vcenter">
		 Add a Password in case you lose your account
		</Modal.Title>
	  </Modal.Header>
	  <Modal.Body>
		<Form.Group className="mb-3" controlId="formBasicPassword">
			<Form.Label>Password</Form.Label>
			<Form.Control 
						type="password" 
						placeholder="Password"
						value={secret}
						onChange={e => setSecret(e.target.value)}
			 />
		  </Form.Group>
	  </Modal.Body>
	  <Modal.Footer>
		<Button onClick={ (e) => props.commit(secret)}>Submit Commit</Button>
	  </Modal.Footer>
	</Modal>
	);
}

export default MyModal;
