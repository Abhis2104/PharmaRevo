import React, { useState, useEffect } from "react";
import { collection, addDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../firebase";
import { uploadToCloudinary } from "../utils/uploadToCloudinary";

interface AddDonationFormProps {
  onDonationAdded?: () => void;
}

const AddDonationForm: React.FC<AddDonationFormProps> = ({ onDonationAdded }) => {
  const [medicineName, setMedicineName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pickupAddress, setPickupAddress] = useState("");
  const [city, setCity] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [landmark, setLandmark] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [consentGiven, setConsentGiven] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation checks
    if (!currentUser) {
      alert("Please sign in first");
      return;
    }

    if (!medicineName.trim() || !expiryDate || !quantity || !pickupAddress.trim() || !city.trim() || !pinCode.trim() || !contactNumber.trim()) {
      alert("Please fill all required fields");
      return;
    }

    if (!consentGiven) {
      alert("Please give your consent before donating.");
      return;
    }

    if (!/^[0-9]{10}$/.test(contactNumber)) {
      alert("Please enter a valid 10-digit contact number");
      return;
    }

    if (image) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      
      if (image.size > maxSize) {
        alert("Image size should be less than 5MB");
        return;
      }
      
      if (!allowedTypes.includes(image.type)) {
        alert("Please upload a valid image file (JPEG, PNG, WebP)");
        return;
      }
    }

    setLoading(true);
    
    try {
      let imageUrl = "";
      
      // Upload image to Cloudinary if provided
      if (image) {
        try {
          console.log("Uploading image to Cloudinary...");
          imageUrl = await uploadToCloudinary(image);
          console.log("Image uploaded successfully:", imageUrl);
        } catch (uploadError) {
          console.error("Cloudinary upload failed:", uploadError);
          
          const continueWithoutImage = window.confirm(
            `Image upload failed: ${uploadError.message}\n\nWould you like to continue submitting the donation without the image?`
          );
          
          if (!continueWithoutImage) {
            setLoading(false);
            return;
          }
          
          imageUrl = ""; // Continue without image
        }
      }
      
      // Prepare donation data
      const donationData = {
        medicineName: medicineName.trim(),
        expiryDate: expiryDate,
        quantity: parseInt(quantity, 10),
        description: description.trim(),
        imageUrl: imageUrl,
        pickupAddress: {
          address: pickupAddress.trim(),
          city: city.trim(),
          pinCode: pinCode.trim(),
          landmark: landmark.trim()
        },
        contactNumber: contactNumber.trim(),
        donorId: currentUser.uid,
        consentChain: [
          {
            stage: "Donor Consent",
            actor: currentUser.uid,
            actorLabel: "Donor",
            timestamp: Date.now(),
            note: "Donor voluntarily agreed to donate this medicine for ethical redistribution."
          }
        ],
        status: "Pending",
        deliveryStatus: "pending_pickup",
        assignedVolunteerId: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        source: "individual"
      };
      
      console.log("Saving donation to Firestore...");
      const docRef = await addDoc(collection(db, "donations"), donationData);
      console.log("Donation saved successfully with ID:", docRef.id);

      // Reset form completely
      setMedicineName("");
      setExpiryDate("");
      setQuantity("");
      setDescription("");
      setImage(null);
      setImagePreview(null);
      setPickupAddress("");
      setCity("");
      setPinCode("");
      setLandmark("");
      setContactNumber("");
      setConsentGiven(false);
      
      // Reset file input element
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
      alert("✅ Donation submitted successfully! It will be reviewed by our admin team.");
      
      // Trigger refresh callback
      if (onDonationAdded) {
        setTimeout(() => onDonationAdded(), 100);
      }
      
    } catch (error: any) {
      console.error("Donation submission error:", error);
      
      let errorMessage = "Failed to submit donation. ";
      
      // Handle Firestore errors
      if (error.code) {
        switch (error.code) {
          case 'permission-denied':
            errorMessage += "Permission denied. Please check your authentication.";
            break;
          case 'unavailable':
            errorMessage += "Service temporarily unavailable. Please try again.";
            break;
          case 'deadline-exceeded':
            errorMessage += "Request timeout. Please check your internet connection.";
            break;
          default:
            errorMessage += error.message || "Unknown error occurred.";
        }
      } else {
        errorMessage += error.message || "Please try again later.";
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Medicine Name
        </label>
        <input
          type="text"
          value={medicineName}
          onChange={(e) => setMedicineName(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Expiry Date
        </label>
        <input
          type="date"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <p className="text-xs text-blue-600 mt-1 flex items-start">
          <span className="mr-1">💬</span>
          Check the expiry date printed near MFG or EXP on the strip or carton. If unclear, upload a clear photo and our verification team will confirm it.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Quantity
        </label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
          min="1"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Medicine Image (Optional)
        </label>
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            setImage(file);
            
            if (file) {
              const reader = new FileReader();
              reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
              };
              reader.readAsDataURL(file);
            } else {
              setImagePreview(null);
            }
          }}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <p className="text-xs text-green-600 mt-1">
          ✅ Free image hosting via Cloudinary (Max 5MB)
        </p>
        
        {imagePreview && (
          <div className="mt-3">
            <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Medicine preview"
                className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
              />
              <button
                type="button"
                onClick={() => {
                  setImage(null);
                  setImagePreview(null);
                  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                  if (fileInput) fileInput.value = '';
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Address Fields */}
      <div className="border-t pt-4">
        <h4 className="font-semibold text-gray-700 mb-3">📍 Pickup Address</h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Address</label>
            <textarea
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              required
              rows={2}
              placeholder="Enter complete pickup address"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                placeholder="Enter city"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pin Code</label>
              <input
                type="text"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                required
                placeholder="Enter pin code"
                pattern="[0-9]{6}"
                maxLength={6}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Landmark (Optional)</label>
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="Enter nearby landmark"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
            <input
              type="tel"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value.replace(/\D/g, ''))}
              required
              placeholder="Enter 10-digit contact number"
              maxLength={10}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Consent Checkbox */}
      <div className="border-t pt-4">
        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consentGiven}
            onChange={e => setConsentGiven(e.target.checked)}
            className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">
            ✅ I voluntarily consent to donate this medicine for ethical redistribution through PharmaRevo. I confirm the medicine is safe, unexpired, and in original packaging. This consent will be recorded as part of the Consent-to-Care Chain.
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading || !consentGiven}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Adding..." : "Add Donation"}
      </button>
    </form>
  );
};

export default AddDonationForm;