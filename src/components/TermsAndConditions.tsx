import React, { useState } from 'react';
import { FileText, Car, Wrench, Shield, AlertTriangle, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';

export const TermsAndConditions: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'self-drive' | 'car-services'>('self-drive');

  const SelfDriveTerms = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Car className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Self-Drive Car Rental Terms & Conditions</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Please read these terms carefully before booking your self-drive car rental. 
          By proceeding with the booking, you agree to these terms and conditions.
        </p>
      </div>

      {/* Important Notice */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start">
          <AlertTriangle className="w-6 h-6 text-red-600 mr-3 mt-1 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Important Notice</h3>
            <p className="text-red-800">
              These terms and conditions are legally binding. Please ensure you understand all clauses before confirming your booking. 
              Violation of any terms may result in additional charges and legal action.
            </p>
          </div>
        </div>
      </div>

      {/* Terms Sections */}
      <div className="space-y-8">
        {/* 1. Damage and Insurance */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Shield className="w-6 h-6 mr-3 text-blue-600" />
            1. Damage Recovery and Insurance Coverage
          </h3>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Insurance Coverage</h4>
              <p className="text-blue-800 text-sm">
                Any damages to the vehicle will be recovered based on insurance eligibility. The customer is responsible for 
                damages not covered under the insurance policy.
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-semibold text-red-900 mb-2">Exclusions - Not Covered Under Insurance</h4>
              <ul className="text-red-800 text-sm space-y-2">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span><strong>Tire Damages:</strong> Punctures, sidewall damage, wear and tear, or any tire-related issues</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span><strong>Electrical Components:</strong> Damage to wiring, ECU, sensors, lights, or any electrical systems</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span><strong>Rat Damage:</strong> Any damage caused by rodents including chewed wires, upholstery, or components</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span><strong>Interior Damages:</strong> Stains, burns, tears, or damage to seats, dashboard, carpets, or interior components</span>
                </li>
              </ul>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>Note:</strong> Customers will be charged the full repair/replacement cost for damages not covered under insurance. 
                A detailed inspection will be conducted before and after the rental period.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Drop & Pick Up Charges */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Car className="w-6 h-6 mr-3 text-green-600" />
            2. Drop & Pick Up Charges
          </h3>
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Distance-Based Charges</h4>
              <p className="text-green-800 text-sm mb-3">
                Drop and pick-up charges are calculated based on the distance from our base location at 
                <strong> Electronic City Phase 1, Bangalore</strong>.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded border">
                  <h5 className="font-medium text-gray-900">Distance Slabs</h5>
                  <ul className="text-sm text-gray-700 mt-2 space-y-1">
                    <li>• 0-10 km: ₹200</li>
                    <li>• 11-25 km: ₹400</li>
                    <li>• 26-50 km: ₹600</li>
                    <li>• 51+ km: ₹15/km</li>
                  </ul>
                </div>
                <div className="bg-white p-3 rounded border">
                  <h5 className="font-medium text-gray-900">Additional Charges</h5>
                  <ul className="text-sm text-gray-700 mt-2 space-y-1">
                    <li>• Night charges (10 PM - 6 AM): +50%</li>
                    <li>• Weekend charges: +25%</li>
                    <li>• Traffic delays: ₹100/hour</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>App Delivery Payment:</strong> If delivery charges are paid through the app during booking, 
                no additional charges will be applied at the time of delivery.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Washing Charges */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Wrench className="w-6 h-6 mr-3 text-purple-600" />
            3. Vehicle Cleanliness and Washing Charges
          </h3>
          <div className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">Cleanliness Standards</h4>
              <p className="text-purple-800 text-sm mb-3">
                The vehicle must be returned in the same clean condition as it was provided. 
                Failure to maintain cleanliness standards will result in washing charges.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded border">
                  <h5 className="font-medium text-gray-900">Washing Charges</h5>
                  <ul className="text-sm text-gray-700 mt-2 space-y-1">
                    <li>• Basic exterior wash: ₹300</li>
                    <li>• Interior cleaning: ₹500</li>
                    <li>• Deep cleaning: ₹800</li>
                    <li>• Odor removal: ₹1,000</li>
                  </ul>
                </div>
                <div className="bg-white p-3 rounded border">
                  <h5 className="font-medium text-gray-900">Conditions Requiring Cleaning</h5>
                  <ul className="text-sm text-gray-700 mt-2 space-y-1">
                    <li>• Excessive dirt or mud</li>
                    <li>• Food spills or stains</li>
                    <li>• Strong odors</li>
                    <li>• Pet hair or dander</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Pet Travel Charges */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Car className="w-6 h-6 mr-3 text-orange-600" />
            4. Pet Travel and Interior Cleaning
          </h3>
          <div className="space-y-4">
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-semibold text-orange-900 mb-2">Pet Travel Policy</h4>
              <p className="text-orange-800 text-sm mb-3">
                Pets are allowed in our vehicles with prior notification and additional charges for specialized cleaning.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded border">
                  <h5 className="font-medium text-gray-900">Pet Cleaning Charges</h5>
                  <ul className="text-sm text-gray-700 mt-2 space-y-1">
                    <li>• Small pets (cats, small dogs): ₹800</li>
                    <li>• Medium pets: ₹1,200</li>
                    <li>• Large pets: ₹1,500</li>
                    <li>• Multiple pets: +50% per additional pet</li>
                  </ul>
                </div>
                <div className="bg-white p-3 rounded border">
                  <h5 className="font-medium text-gray-900">Requirements</h5>
                  <ul className="text-sm text-gray-700 mt-2 space-y-1">
                    <li>• Prior notification mandatory</li>
                    <li>• Pet carrier recommended</li>
                    <li>• Vaccination certificates required</li>
                    <li>• Customer liable for any damage</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Smoking and Alcohol Policy */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-6 h-6 mr-3 text-red-600" />
            5. Smoking and Alcohol Prohibition
          </h3>
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-semibold text-red-900 mb-2">Strict Prohibition</h4>
              <p className="text-red-800 text-sm mb-3">
                Smoking and alcohol consumption are strictly prohibited inside the vehicle and during driving.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded border border-red-200">
                  <h5 className="font-medium text-red-900">Smoking Violations</h5>
                  <ul className="text-sm text-red-800 mt-2 space-y-1">
                    <li>• First offense: ₹5,000 fine</li>
                    <li>• Odor removal charges: ₹3,000</li>
                    <li>• Deep cleaning: ₹2,000</li>
                    <li>• Permanent ban for repeat offenses</li>
                  </ul>
                </div>
                <div className="bg-white p-3 rounded border border-red-200">
                  <h5 className="font-medium text-red-900">Alcohol Violations</h5>
                  <ul className="text-sm text-red-800 mt-2 space-y-1">
                    <li>• Immediate vehicle termination</li>
                    <li>• ₹10,000 penalty</li>
                    <li>• Legal action if driving under influence</li>
                    <li>• Permanent account suspension</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-yellow-800 text-sm">
                <strong>Detection Methods:</strong> Our vehicles are equipped with sensors and cameras. 
                Any violation will be detected and appropriate action will be taken immediately.
              </p>
            </div>
          </div>
        </div>

        {/* 6. ID Proof Requirement */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <FileText className="w-6 h-6 mr-3 text-indigo-600" />
            6. Mandatory ID Proof and Documentation
          </h3>
          <div className="space-y-4">
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h4 className="font-semibold text-indigo-900 mb-2">Required Documents</h4>
              <p className="text-indigo-800 text-sm mb-3">
                Valid ID proof is mandatory for all self-drive car rentals. No exceptions will be made.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded border">
                  <h5 className="font-medium text-gray-900">Acceptable ID Proofs</h5>
                  <ul className="text-sm text-gray-700 mt-2 space-y-1">
                    <li>• Aadhaar Card (original)</li>
                    <li>• Passport (original)</li>
                    <li>• Voter ID Card</li>
                    <li>• PAN Card (with photo)</li>
                  </ul>
                </div>
                <div className="bg-white p-3 rounded border">
                  <h5 className="font-medium text-gray-900">Additional Requirements</h5>
                  <ul className="text-sm text-gray-700 mt-2 space-y-1">
                    <li>• Valid Driving License</li>
                    <li>• Credit/Debit Card</li>
                    <li>• Address Proof</li>
                    <li>• Emergency Contact Details</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-red-800 text-sm">
                <strong>Important:</strong> Photocopies or digital copies are not acceptable. 
                Original documents must be presented at the time of vehicle pickup. 
                Failure to provide valid ID will result in booking cancellation without refund.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Terms */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Additional Terms and Conditions</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">General Terms</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Minimum age requirement: 21 years</li>
                <li>• Valid driving license for minimum 1 year</li>
                <li>• Security deposit required</li>
                <li>• Fuel to be returned at same level</li>
                <li>• Speed limit violations will be penalized</li>
                <li>• GPS tracking enabled for security</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Cancellation Policy</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Free cancellation up to 24 hours before pickup</li>
                <li>• 50% charges for cancellation within 24 hours</li>
                <li>• No refund for no-show</li>
                <li>• Modification charges may apply</li>
                <li>• Emergency cancellations considered case by case</li>
                <li>• Refund processing time: 5-7 business days</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const CarServicesTerms = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wrench className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Car Services Terms & Conditions</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Please read these terms carefully before booking any car service. 
          By proceeding with the service booking, you agree to these terms and conditions.
        </p>
      </div>

      {/* Service Quality Guarantee */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start">
          <CheckCircle className="w-6 h-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">Service Quality Guarantee</h3>
            <p className="text-green-800">
              We guarantee professional service quality with certified technicians and genuine parts. 
              All services come with warranty and satisfaction guarantee.
            </p>
          </div>
        </div>
      </div>

      {/* Service Terms */}
      <div className="space-y-8">
        {/* 1. Service Booking and Scheduling */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Car className="w-6 h-6 mr-3 text-blue-600" />
            1. Service Booking and Scheduling
          </h3>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Booking Requirements</h4>
              <ul className="text-blue-800 text-sm space-y-2">
                <li>• Advance booking required (minimum 24 hours)</li>
                <li>• Vehicle registration documents mandatory</li>
                <li>• Customer ID proof required</li>
                <li>• Service history documentation (if available)</li>
                <li>• Clear description of issues or requirements</li>
              </ul>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-2">Scheduling Policy</h4>
              <ul className="text-yellow-800 text-sm space-y-2">
                <li>• Service slots allocated on first-come-first-serve basis</li>
                <li>• Rescheduling allowed up to 12 hours before appointment</li>
                <li>• Late arrival may result in rescheduling</li>
                <li>• Emergency services available with additional charges</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 2. Service Warranty and Guarantee */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Shield className="w-6 h-6 mr-3 text-green-600" />
            2. Service Warranty and Guarantee
          </h3>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Warranty Coverage</h4>
                <ul className="text-green-800 text-sm space-y-1">
                  <li>• Cleaning services: 7 days</li>
                  <li>• Maintenance services: 30 days</li>
                  <li>• Repair services: 90 days</li>
                  <li>• Parts replacement: 6 months</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Guarantee Terms</h4>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• 100% satisfaction guarantee</li>
                  <li>• Free re-service if unsatisfied</li>
                  <li>• Genuine parts guarantee</li>
                  <li>• Certified technician service</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Payment and Pricing */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <FileText className="w-6 h-6 mr-3 text-purple-600" />
            3. Payment Terms and Pricing
          </h3>
          <div className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">Payment Policy</h4>
              <ul className="text-purple-800 text-sm space-y-2">
                <li>• Advance payment required for booking confirmation</li>
                <li>• Balance payment due upon service completion</li>
                <li>• Additional charges for extra services will be informed beforehand</li>
                <li>• All payments include applicable taxes</li>
                <li>• Digital payment preferred for contactless service</li>
              </ul>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-semibold text-orange-900 mb-2">Additional Charges</h4>
              <ul className="text-orange-800 text-sm space-y-2">
                <li>• Parts replacement: Actual cost + 15% service charge</li>
                <li>• Emergency services: +50% of regular charges</li>
                <li>• Weekend/holiday services: +25% surcharge</li>
                <li>• Pickup/drop services: Distance-based charges</li>
                <li>• Waiting time: ₹100 per hour after 30 minutes</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 4. Customer Responsibilities */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-6 h-6 mr-3 text-orange-600" />
            4. Customer Responsibilities
          </h3>
          <div className="space-y-4">
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-semibold text-orange-900 mb-2">Before Service</h4>
              <ul className="text-orange-800 text-sm space-y-2">
                <li>• Remove all personal belongings from the vehicle</li>
                <li>• Ensure vehicle has sufficient fuel (if required)</li>
                <li>• Provide accurate vehicle information and service history</li>
                <li>• Inform about any specific issues or concerns</li>
                <li>• Arrive on time for scheduled appointment</li>
              </ul>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-semibold text-red-900 mb-2">Customer Liability</h4>
              <ul className="text-red-800 text-sm space-y-2">
                <li>• Customer responsible for any pre-existing damage not reported</li>
                <li>• Lost or stolen items from vehicle not our responsibility</li>
                <li>• Customer liable for providing accurate vehicle information</li>
                <li>• Any damage due to customer negligence will be charged</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 5. Service Limitations and Exclusions */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Shield className="w-6 h-6 mr-3 text-red-600" />
            5. Service Limitations and Exclusions
          </h3>
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-semibold text-red-900 mb-2">Service Exclusions</h4>
              <ul className="text-red-800 text-sm space-y-2">
                <li>• Damage due to accidents or collisions</li>
                <li>• Wear and tear beyond normal usage</li>
                <li>• Damage due to natural disasters or acts of God</li>
                <li>• Issues arising from unauthorized modifications</li>
                <li>• Problems due to use of non-genuine parts elsewhere</li>
                <li>• Damage due to negligent driving or misuse</li>
              </ul>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-2">Service Limitations</h4>
              <ul className="text-yellow-800 text-sm space-y-2">
                <li>• Services limited to our expertise and equipment capabilities</li>
                <li>• Some specialized services may require external vendors</li>
                <li>• Vintage or rare vehicle parts may have longer procurement time</li>
                <li>• Complex electrical issues may require manufacturer diagnosis</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 6. Cancellation and Refund Policy */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <FileText className="w-6 h-6 mr-3 text-indigo-600" />
            6. Cancellation and Refund Policy
          </h3>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h4 className="font-semibold text-indigo-900 mb-2">Cancellation Terms</h4>
                <ul className="text-indigo-800 text-sm space-y-1">
                  <li>• Free cancellation: 24+ hours before</li>
                  <li>• 50% charges: 12-24 hours before</li>
                  <li>• 100% charges: Less than 12 hours</li>
                  <li>• No-show: Full charges applicable</li>
                </ul>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Refund Process</h4>
                <ul className="text-green-800 text-sm space-y-1">
                  <li>• Refund processing: 5-7 business days</li>
                  <li>• Refund to original payment method</li>
                  <li>• Service-related refunds case by case</li>
                  <li>• Partial refunds for partial services</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Quality Standards */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Our Quality Standards</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Certified Technicians</h4>
              <p className="text-sm text-gray-600">All our technicians are certified and regularly trained on latest automotive technologies.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Genuine Parts</h4>
              <p className="text-sm text-gray-600">We use only genuine or OEM equivalent parts for all repairs and replacements.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Car className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Modern Equipment</h4>
              <p className="text-sm text-gray-600">State-of-the-art diagnostic and service equipment for accurate and efficient service.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
          Terms & Conditions
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Please review our comprehensive terms and conditions for both self-drive car rentals and car services.
        </p>
      </div>

      {/* Section Selector */}
      <div className="bg-white rounded-xl shadow-lg p-2 max-w-md mx-auto">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setActiveSection('self-drive')}
            className={`flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-all ${
              activeSection === 'self-drive'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Car className="w-5 h-5 mr-2" />
            Self-Drive Cars
          </button>
          <button
            onClick={() => setActiveSection('car-services')}
            className={`flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-all ${
              activeSection === 'car-services'
                ? 'bg-green-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Wrench className="w-5 h-5 mr-2" />
            Car Services
          </button>
        </div>
      </div>

      {/* Content */}
      {activeSection === 'self-drive' ? <SelfDriveTerms /> : <CarServicesTerms />}

      {/* Footer */}
      <div className="bg-gray-900 text-white rounded-xl p-8 text-center">
        <h3 className="text-xl font-bold mb-4">Need Clarification?</h3>
        <p className="text-gray-300 mb-6">
          If you have any questions about these terms and conditions, please don't hesitate to contact our support team.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="tel:1-800-374-8332" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Call Support: 1-800-DRIVE-EASY
          </a>
          <a 
            href="mailto:support@driveeasy.com" 
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Email: support@driveeasy.com
          </a>
        </div>
        <p className="text-gray-400 text-sm mt-6">
          Last updated: January 2025 | Version 2.1
        </p>
      </div>
    </div>
  );
};