import React, { useState } from "react";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, auth, storage } from "../firebase";

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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!auth.currentUser) {
      alert("Please sign in first");
      return;
    }

    if (!medicineName.trim() || !expiryDate || !quantity || !pickupAddress.trim() || !city.trim() || !pinCode.trim() || !contactNumber.trim()) {
      alert("Please fill all required fields");
      return;
    }

    // Validate contact number
    if (!/^[0-9]{10}$/.test(contactNumber)) {
      alert("Please enter a valid 10-digit contact number");
      return;
    }

    // Validate image if provided
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
    console.log("Starting donation submission...");
    console.log("Current user:", auth.currentUser.uid);
    
    try {
      let imageUrl = "";
      
      // Upload image first if provided
      if (image) {
        try {
          console.log("Uploading image...", image.name, image.size, image.type);
          
          // Create unique filename with user ID
          const timestamp = new Date().getTime();
          const fileExtension = image.name.split('.').pop() || 'jpg';
          const fileName = `${auth.currentUser.uid}_${timestamp}.${fileExtension}`;
          const imageRef = ref(storage, `donations/${fileName}`);
          
          console.log("Uploading to path:", `donations/${fileName}`);
          
          // Upload with metadata
          const metadata = {
            contentType: image.type,
            customMetadata: {
              'uploadedBy': auth.currentUser.uid,
              'originalName': image.name
            }
          };
          
          const uploadResult = await uploadBytes(imageRef, image, metadata);
          console.log("Upload completed:", uploadResult);
          
          imageUrl = await getDownloadURL(uploadResult.ref);
          console.log("Download URL obtained:", imageUrl);
        } catch (imageError: any) {
          console.error("Detailed image upload error:", {
            message: imageError.message,
            code: imageError.code,
            details: imageError
          });
          
          // Check specific error types
          if (imageError.code === 'storage/unauthorized') {
            alert("Storage permission denied. Please check Firebase Storage rules.");
          } else if (imageError.code === 'storage/quota-exceeded') {
            alert("Storage quota exceeded. Please try again later.");
          } else {
            alert(`Image upload failed: ${imageError.message}. Proceeding without image.`);
          }
        }
      }
      
      // Save donation with or without image
      const donationData = {
        medicineName: medicineName.trim(),
        expiryDate: expiryDate,
        quantity: Number(quantity),
        description: description.trim() || "",
        imageUrl: imageUrl,
        pickupAddress: pickupAddress.trim(),
        city: city.trim(),
        pinCode: pinCode.trim(),
        landmark: landmark.trim(),
        contactNumber: contactNumber.trim(),
        donorId: auth.currentUser.uid,
        status: "Pending",
        createdAt: new Date().getTime(),
      };
      
      console.log("Saving donation...");
      const docRef = await addDoc(collection(db, "donations"), donationData);
      console.log("SUCCESS! Donation saved with ID:", docRef.id);

      // Reset form
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
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      alert("Donation added successfully!");
      
      // Force refresh
      if (onDonationAdded) {
        console.log("Triggering refresh...");
        onDonationAdded();
      }
    } catch (error: any) {
      console.error("ERROR saving donation:", error);
      alert(`Failed: ${error.message}`);
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
        <p className="text-xs text-gray-500 mt-1">
          Supported formats: JPEG, PNG, WebP (Max 5MB)
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

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Adding..." : "Add Donation"}
      </button>
    </form>
  );
};

export default AddDonationForm;