import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Chip } from '@mui/material';
import { Divider } from "@mui/material";
import Collapsible from 'react-collapsible';

const CreatePage = () => {

    const [companyName, setCompanyName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [contactName, setContactName] = useState("");
    const [companyEmail, setCompanyEmail] = useState("");
    const [streetAddress, setStreetAddress] = useState("");
    const [cityAddress, setCityAddress] = useState("");
    const [stateAddress, setStateAddress] = useState("");
    const [zipAddress, setZipAddress] = useState("");
    let [image, setImage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [nameValidity, setNameValidity] = useState(false);
    const [phoneValidity, setPhoneValidity] = useState(false);
    const [emailValidity, setEmailValidity] = useState(false);
    const [zipCodeValidity, setZipCodeValidity] = useState(false);

    const saveCustomer = async() => { //ADD VALIDATION TO CHECK FORMAT OF FIELDS ON SAVE BUTTON CLICKED
        if(image ==="") {
            image = 
                "https://www.iprcenter.gov/image-repository/blank-profile-picture.png/@@images/image.png";
        }

        try {
            setIsLoading(true);
            const response = await axios.post("http://localhost:3000/api/customer", 
            {
                companyName: companyName, phoneNumber: phoneNumber, contactName: contactName, companyEmail: companyEmail, image: image,
                streetAddress:streetAddress, cityAddress: cityAddress, stateAddress: stateAddress, zipAddress: zipAddress
            });
            toast.success(`Save ${response.data.companyName} Successfully`);
            setIsLoading(false);
            navigate("/");
        } catch (error) {
            toast.error(error.message);
            setIsLoading(false);
        }
    }

    const validateName = (tempName) => {
        const prohibitedChars = /[<>:"/\\|?+*\x00-\x1F]/
        var nameTemp = document.getElementById(`nameField`)

        if (tempName=="") {
            toast.error(
                <div>
                    <p>Company Name is a required field, please do not leave it unfilled</p>
                </div>
            )

            nameTemp.classList.remove('border-green-500')
            nameTemp.classList.add('border-red-500')
            setNameValidity(false)
        }

        else if (tempName.match(prohibitedChars)) {
            toast.error(
                <div>
                    <p>Please do not include the following characters in Company Name</p>
                    <p>"  /  |  \  ?  *  :  &lt;  &gt;  +</p>
                </div>
            )

            nameTemp.classList.remove('border-green-500')
            nameTemp.classList.add('border-red-500')
            setNameValidity(false)}

        else {
            nameTemp.classList.remove('border-2', 'border-red-500')
            nameTemp.classList.add('border-green-500')
            setNameValidity(true)
        }
    }

    const validateNumber = (tempNumber) => {
        const valNumber = '^(\\d{10}|\\(?\\d{3}\\)?[\\s.-]\\d{3}[\\s.-]\\d{4})$'  //^(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}|\d{9})$
        var phoneTemp = document.getElementById(`phoneField`)

        if (tempNumber=="") {
            toast.error(
                <div>
                    <p>Phone Number is a required field, please do not leave it unfilled</p>
                </div>
            )

            phoneTemp.classList.remove('border-green-500')
            phoneTemp.classList.add('border-red-500')
            setPhoneValidity(false)
        }

        else if (!tempNumber.match(valNumber)) {
            toast.error(
                <div>
                    <p>Please input phone number in one of the following format:</p> <br/>
                    <p>XXX XXX XXXX</p> <br/>
                    <p>(XXX) XXX-XXXX</p> <br/>
                    <p>XXX-XXX-XXXX</p>
                    <p>XXXXXXXXXX</p>
                </div>
            )

            phoneTemp.classList.remove('border-green-500')
            phoneTemp.classList.add('border-red-500')
            setPhoneValidity(false)
        }

        else {
            phoneTemp.classList.remove('border-2', 'border-red-500')
            phoneTemp.classList.add('border-green-500')

            let chars = [...tempNumber]
            console.log(chars.length)
            if (chars.length==12) {
                chars.splice(0, 0, "(");
                chars.splice(4, 1, ") ");
                chars.splice(8, 1, "-");
                setPhoneNumber(chars.join(''));
            }
            else if(chars.length==10){
                chars.splice(0, 0, "(")
                chars.splice(4, 0, ") ")
                chars.splice(8, 0, "-")
                setPhoneNumber(chars.join(''));
            }
            
            setPhoneValidity(true)
        }
    }

    const validateEmail = (tempEmail) => {
        const valEmail = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
        var emailTemp = document.getElementById(`emailField`)

        if (tempEmail=="") {
            toast.error(
                <div>
                    <p>Email is a required field, please do not leave it unfilled</p>
                </div>
            )

            emailTemp.classList.remove('border-green-500')
            emailTemp.classList.add('border-red-500')
            setEmailValidity(false)
        }

        else if(!tempEmail.match(valEmail)) {
            toast.error(
                <div>
                    <p>Please input email in the following format:</p> <br/>
                    <p>emailAddress@domain.type</p>
                </div>
            )

            emailTemp.classList.remove('border-green-500')
            emailTemp.classList.add('border-red-500')
            setEmailValidity(false)
        }
        else {
            emailTemp.classList.remove('border-2', 'border-red-500')
            emailTemp.classList.add('border-green-500')
            setEmailValidity(true)
        }
    }

    const validateZipCode = (tempZipCode) => {
        const valZipCode = '^\\d{5}(-\\d{4})?$'
        var zipCodeTemp = document.getElementById(`zipCodeField`)

        if (tempZipCode=="") {
            toast.error(
                <div>
                    <p>Zip Code is a required field, please do not leave it unfilled</p>
                </div>
            )

            zipCodeTemp.classList.remove('border-green-500')
            zipCodeTemp.classList.add('border-red-500')
            setZipCodeValidity(false)
        }

        else if(!tempZipCode.match(valZipCode)) {
            toast.error(
                <div>
                    <p>Please input Zip Code in the following format:</p> <br/>
                    <p>XXXXX</p>
                    <p>XXXXX-XXXX</p>
                </div>
            )

            zipCodeTemp.classList.remove('border-green-500')
            zipCodeTemp.classList.add('border-red-500')
            setZipCodeValidity(false)
        }
        else {
            zipCodeTemp.classList.remove('border-2', 'border-red-500')
            zipCodeTemp.classList.add('border-green-500')
            setZipCodeValidity(true)
        }
    }

    const checkValidity = (e) => {
        e.preventDefault();
        if(!phoneValidity || !emailValidity || !zipCodeValidity || !nameValidity) {
            toast.error('Check company name, phone number, email, and zip code for correct format');
            var phoneTemp = document.getElementById(`phoneField`)
            var emailTemp = document.getElementById(`emailField`)
            var zipCodeTemp = document.getElementById(`zipCodeField`)
            var nameTemp = document.getElementById(`nameField`)

            nameValidity?true:nameTemp.classList.add('border-2', 'border-red-500')
            phoneValidity?true:phoneTemp.classList.add('border-2', 'border-red-500')
            emailValidity?true:emailTemp.classList.add('border-2', 'border-red-500')
            zipCodeValidity?true:zipCodeTemp.classList.add('border-2', 'border-red-500')

            return;
        }
        
        else saveCustomer();
    }

    return (
        <div className="max-w-lg bg-white shadow-lg mx-auto p-7 rounded mt-6">
            <h2 className="font-semibold text-2xl mb-4 block text-center">
                Create a Customer
            </h2>
            <div className="mb-3"><Divider variant="middle"/></div>
            <form onSubmit={checkValidity}>
                <div className="space-y-2">
                    <div>
                        <Collapsible trigger={<Chip label="Contact Info ⤵" size="small" />} open={true}>
                            <div className="block mt-1">
                                <label className="text-gray-600 mb-2 block font-semibold">Company Name</label>
                                <input id="nameField" type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} onBlur={(e) => validateName(e.target.value)} className="w-3/4 flex ml-7 border p-3 align-center text-gray-600 rounded focus:outline-none focus:shadow-outline focus:border-blue-200 placeholder-gray-400" placeholder="Company Name" />
                            </div>
                            <div>
                                <label className="text-gray-600 mb-2 block font-semibold">Phone Number</label>
                                <input id="phoneField" type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} onBlur={(e) => validateNumber(e.target.value)} className="w-3/4 flex ml-7 border p-3 text-gray-600 rounded focus:outline-none focus:shadow-outline focus:border-blue-200 placeholder-gray-400" placeholder="Phone Number" />
                            </div>
                            <div>
                                <label className="text-gray-600 mb-2 block font-semibold">Email</label>
                                <input id="emailField" type="text" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} onBlur={(e) => validateEmail(e.target.value)} className="w-3/4 flex ml-7 border p-3 text-gray-600 rounded focus:outline-none focus:shadow-outline focus:border-blue-200 placeholder-gray-400" placeholder="Email" />
                            </div>
                            <div>
                                <label className="text-gray-600 mb-2 block font-semibold">Contact Name</label>
                                <input id="contactField" type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} className="w-3/4 flex ml-7 border p-3 text-gray-600  rounded focus:outline-none focus:shadow-outline focus:border-blue-200 placeholder-gray-400" placeholder="Contact Name" />
                            </div>
                            <div>
                                <label className="text-gray-600 mb-2 block font-semibold">Image URL</label>
                                <input type="text" value={image} onChange={(e) => setImage(e.target.value)} className="w-3/4 flex ml-7 border p-3 text-gray-600 rounded focus:outline-none focus:shadow-outline focus:border-blue-200 placeholder-gray-400" placeholder="Image URL" />
                            </div>
                        </Collapsible>
                    </div>
                    <div>
                        <Collapsible trigger={<Chip label="Address ⤵" size="small" />}>
                            <div className="mt-1">
                                <label className="text-gray-600 mb-2 block font-semibold">Street</label>
                                <input type="text" value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} className="w-3/4 flex ml-7 border p-3 text-gray-600  rounded focus:outline-none focus:shadow-outline focus:border-blue-200 placeholder-gray-400" placeholder="Street Address" />
                            </div>
                            <div>
                                <label className="text-gray-600 mb-2 block font-semibold">City</label>
                                <input type="text" value={cityAddress} onChange={(e) => setCityAddress(e.target.value)} className="w-3/4 flex ml-7 border p-3 text-gray-600  rounded focus:outline-none focus:shadow-outline focus:border-blue-200 placeholder-gray-400" placeholder="City" />
                            </div>
                            <div>
                                <label className="text-gray-600 mb-2 block font-semibold">State (Abbrev)</label>
                                <input type="text" value={stateAddress} onChange={(e) => setStateAddress(e.target.value)} className="w-3/4 flex ml-7 border p-3 text-gray-600  rounded focus:outline-none focus:shadow-outline focus:border-blue-200 placeholder-gray-400" placeholder="State" />
                            </div>
                            <div>
                                <label className="text-gray-600 mb-2 block font-semibold">Zip Code</label>
                                <input id="zipCodeField" type="text" value={zipAddress} onChange={(e) => setZipAddress(e.target.value)} onBlur={(e) => validateZipCode(e.target.value)} className="w-3/4 flex ml-7 border p-3 text-gray-600  rounded focus:outline-none focus:shadow-outline focus:border-blue-200 placeholder-gray-400" placeholder="Zip Code" />
                            </div>
                        </Collapsible>
                    </div>
                    <div className="flex justify-center">
                        { !isLoading &&  (<button className="block w-1/2 mt-6 bg-blue-700 text-white rounded-sm py-2 font-bold transition ease-in-out duration-300 hover:scale-110 hover:bg-blue-600 hover:cursor-pointer">Save</button>)}
                        
                    </div>
                </div>
            </form>
        </div>
    );
}

export default CreatePage;
