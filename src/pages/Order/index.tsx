import React, { useState } from 'react';
import {
  IonApp,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonInput,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonToggle,
} from '@ionic/react';
import { locationOutline, swapVerticalOutline, flashOutline } from 'ionicons/icons';

const FormGroup = ({ index, formData, setFormData }) => {
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const newFormData = [...formData];
    newFormData[index].image = URL.createObjectURL(file);
    setFormData(newFormData);
  };

  const handleQuantityChange = (e) => {
    const quantity = e.target.value;
    const newFormData = [...formData];
    newFormData[index].quantity = quantity;
    setFormData(newFormData);
  };

  return (
    <div className="form-group flex">
      <input
        type="file"
        onChange={handleImageChange}
      />
      {formData[index].image && (
        <img src={formData[index].image} alt="uploaded" width="100" height="100" />
      )}
      <input
        type="number"
        value={formData[index].quantity}
        onChange={handleQuantityChange}
        placeholder="Quantity"
      />
    </div>
  );
};

export default function Order(params) {

  const [formData, setFormData] = useState([
    { image: '', quantity: 1 }
  ]);

  const addFormGroup = () => {
    setFormData([...formData, { image: '', quantity: 1 }]);
  };

  return (
    <div className="app">
      {formData.map((data, index) => (
        <FormGroup
          key={index}
          index={index}
          formData={formData}
          setFormData={setFormData}
        />
      ))}
      <button onClick={addFormGroup}>+</button>
    </div>
  );
};
