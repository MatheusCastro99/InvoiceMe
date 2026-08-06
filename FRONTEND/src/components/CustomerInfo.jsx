import { Chip } from '@mui/material';
import CollapsibleImport from 'react-collapsible';
const Collapsible = CollapsibleImport && (CollapsibleImport.default || CollapsibleImport);

const CustomerInfo = ({customer}) => {


    return (
        <div>
            <div className="max-w-md">
                <div>
                <label className="mb-2 mt-4 block font-semibold">
                    Company Name
                </label>
                <input
                    readOnly={true} 
                    type="text"
                    value={customer.companyName || ''}
                    className="text-lg mb-2 block text-center"
                />
                </div>
                <div>
                <label className="mb-2 block font-semibold">
                    Phone Number
                </label>
                <input
                    readOnly={true}
                    type="text"
                    value={customer.phoneNumber || ''}
                    className="text-lg mb-2 block text-center"
                />
                </div>
                <div>
                <label className="mb-2 block font-semibold">
                    Contact Name
                </label>
                <input
                    readOnly={true}
                    type="text"
                    value={customer.contactName || ''}
                    className="text-lg mb-2 block text-center"
                />
                </div>
                <div>
                <label className="mb-2 block font-semibold">
                    Email
                </label>
                <input
                    readOnly={true}
                    type="text"
                    value={customer.companyEmail || ''}
                    className="text-lg mb-2 block text-center"
                />
                </div>
                <Collapsible trigger={<Chip label="Address ⤵" size="small" />}>
                <div>
                <label className="mb-2 mt-2 block font-semibold">
                    Street Address
                </label>
                <input
                    readOnly={true}
                    type="text"
                    value={customer.streetAddress || ''}
                    className="text-lg mb-2 block text-center"
                />
                </div>
                <div>
                <label className="mb-2 block font-semibold">
                    City
                </label>
                <input
                    readOnly={true}
                    type="text"
                    value={customer.cityAddress || ''}
                    className="text-lg mb-2 block text-center"
                />
                </div>
                <div>
                <label className="mb-2 block font-semibold">
                    State
                </label>
                <input
                    readOnly={true}
                    type="text"
                    value={customer.stateAddress || ''}
                    className="text-lg mb-2 block text-center"
                />
                </div>
                <div>
                <label className="mb-2 block font-semibold">
                    Zip Code
                </label>
                <input
                    readOnly={true}
                    type="text"
                    value={customer.zipAddress || ''}
                    className="text-lg mb-2 block text-center"
                />
                </div>
                </Collapsible>
            </div>
        </div>
    )
}

export default CustomerInfo