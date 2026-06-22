"use client";

import { X, Printer, Check, Percent } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface UnifiedInvoiceProps {
  onClose: () => void;
  invoiceType: 'AMC' | 'SERVICE' | 'INSTALLATION';
  customerName: string;
  customerPhone?: string | null;
  customerAddress: string;
  items: Array<{
    name: string;
    qty: number;
    unit?: string;
    price: number;
    amount: number;
  }>;
  subtotal: number;
  received: number;
  paymentMethod: string;
  date?: string | Date;
  onCollectPayment?: () => void;
  defaultGstEnabled?: boolean;
  recordId?: string;
  onSaveSuccess?: () => void;
}

// Convert numbers to words (Indian Rupee style)
function numberToWords(num: number): string {
  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 
    'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const parsedNum = Math.floor(num);
  if (parsedNum === 0) return 'Zero Rupees Only';
  if (parsedNum.toString().length > 9) return 'Amount too large';
  
  const n = ('000000000' + parsedNum).slice(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  
  let str = '';
  str += Number(n[1]) !== 0 ? (a[Number(n[1])] || b[Number(n[1][0])] + ' ' + a[Number(n[1][1])]) + 'Crore ' : '';
  str += Number(n[2]) !== 0 ? (a[Number(n[2])] || b[Number(n[2][0])] + ' ' + a[Number(n[2][1])]) + 'Lakh ' : '';
  str += Number(n[3]) !== 0 ? (a[Number(n[3])] || b[Number(n[3][0])] + ' ' + a[Number(n[3][1])]) + 'Thousand ' : '';
  str += Number(n[4]) !== 0 ? (a[Number(n[4])] || b[Number(n[4][0])] + ' ' + a[Number(n[4][1])]) + 'Hundred ' : '';
  str += Number(n[5]) !== 0 ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[Number(n[5][0])] + ' ' + a[Number(n[5][1])]) : '';
  
  return str.trim() + ' Rupees Only';
}

export function UnifiedInvoiceModal({
  onClose,
  invoiceType,
  customerName,
  customerPhone,
  customerAddress,
  items,
  subtotal,
  received,
  paymentMethod,
  date,
  onCollectPayment,
  defaultGstEnabled = false,
  recordId,
  onSaveSuccess
}: UnifiedInvoiceProps) {
  // 0. Customer Info State (Editable)
  const [custName, setCustName] = useState(customerName);
  const [custPhone, setCustPhone] = useState(customerPhone || "");
  const [custAddress, setCustAddress] = useState(customerAddress);

  // 1. Business & Header Info State (Defaulting to Amar Enterprises & traditional formats)
  const [businessName, setBusinessName] = useState("Aman Enterprises");
  const [businessAddress, setBusinessAddress] = useState("7/50 Quaters Near Power House Birla Nagar Hazira");
  const [businessCityState, setBusinessCityState] = useState("Gwalior - 474004");
  const [businessPhone, setBusinessPhone] = useState("9039811722 07514081995");
  const [businessEmail, setBusinessEmail] = useState("parvindar.singh077@gmail.com");
  const [businessState, setBusinessState] = useState("23-Madhya Pradesh");
  
  // 2. Invoice Meta Details
  const [invoiceNo, setInvoiceNo] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [placeOfSupply, setPlaceOfSupply] = useState("23-Madhya Pradesh");
  const [transporterName, setTransporterName] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [deliveryNoteDate, setDeliveryNoteDate] = useState("");
  const [buyersOrderNo, setBuyersOrderNo] = useState("");
  const [datedField, setDatedField] = useState("");

  // 3. Financial & GST Config
  const [gstEnabled, setGstEnabled] = useState(defaultGstEnabled);
  const [gstPercentage, setGstPercentage] = useState(18);
  const [previousBalance, setPreviousBalance] = useState(0);
  const [paymentMode, setPaymentMode] = useState(paymentMethod || "Cash");
  const [termsAndConditions, setTermsAndConditions] = useState("Thank you for doing business with us.");
  const [amountReceived, setAmountReceived] = useState(received);

  // Initialize date & auto-increment invoice number from DB
  useEffect(() => {
    // Set formatted date
    const d = date ? new Date(date) : new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    setInvoiceDate(`${day}-${month}-${year}`);

    // Fetch next sequential invoice number
    fetch('/api/invoice-count')
      .then(res => res.json())
      .then(data => {
        const nextNum = String(data.count + 1).padStart(5, '0');
        setInvoiceNo(nextNum);
      })
      .catch(() => {
        setInvoiceNo("00001");
      });
  }, [date]);

  // Calculate Subtotal & Optional GST
  const calcSubtotal = subtotal;
  const gstAmount = gstEnabled ? (calcSubtotal * (gstPercentage / 100)) : 0;
  const grandTotal = calcSubtotal + gstAmount;
  const balance = Math.max(0, grandTotal - amountReceived);
  const currentBalance = balance + Number(previousBalance);

  const handlePrint = () => {
    window.print();
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSavePermanentChanges = async () => {
    setIsSaving(true);
    try {
      const payload: any = {};
      
      if (invoiceType === 'INSTALLATION' && recordId) {
        payload.customerName = custName;
        payload.customerPhone = custPhone;
        payload.address = custAddress;
        payload.amountPaid = amountReceived;
        payload.totalPrice = grandTotal;
        payload.amountDue = balance;
        payload.paymentMethod = paymentMode;
        
        const res = await fetch(`/api/installations/${recordId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Failed to update installation");
      }
      
      else if (invoiceType === 'AMC' && recordId) {
        payload.customerName = custName;
        payload.customerPhone = custPhone;
        payload.address = custAddress;
        payload.amountPaid = amountReceived;
        payload.totalAmount = grandTotal;
        payload.balanceDue = balance;
        payload.payment = balance <= 0 ? 'Paid' : 'Pending';
        
        const res = await fetch(`/api/amc/${recordId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Failed to update AMC");
      }
      
      else if (invoiceType === 'SERVICE' && recordId) {
        payload.customerName = custName;
        payload.customerPhone = custPhone;
        payload.address = custAddress;
        payload.costCharged = grandTotal;
        payload.paymentStatus = amountReceived >= grandTotal ? 'Paid' : 'Unpaid';
        
        const res = await fetch(`/api/appointments/${recordId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Failed to update appointment");
      }

      // Also update Customer profile directly if phone exists
      if (custPhone) {
        const res = await fetch(`/api/customers/${encodeURIComponent(custPhone)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: custName,
            address: custAddress,
          })
        });
        if (!res.ok) console.error("Failed to sync customer profile record");
      }

      toast.success("Changes saved permanently!");
      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  // Dynamic logo parts
  // Removed per user request

  return (
    <div className="fixed inset-0 z-[150] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-0 md:p-4 overflow-y-auto">
      {/* Print Specific CSS Styles to isolate only the preview box */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden !important;
          }
          #print-area, #print-area * {
            visibility: visible !important;
          }
          #print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: 1px solid black !important;
            box-shadow: none !important;
            transform: scale(1.0) !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />

      <div className="bg-slate-100 w-full h-full md:h-[90vh] md:max-w-6xl md:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="bg-[#0B1B3D] text-white px-6 py-4 flex items-center justify-between shrink-0 no-print">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-base tracking-wide">Generate Amar Enterprises Invoice</h3>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all active:scale-95 shadow-md shrink-0 flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" /> Print / Save as PDF
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg text-white transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Work Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Sidebar Controls (No-print) */}
          <div className="w-full md:w-80 bg-white border-b md:border-b-0 md:border-r border-slate-200 overflow-y-auto p-5 space-y-5 shrink-0 no-print">
            <div>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-150 pb-2 mb-3">1. Business Profile</h4>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Firm Name</label>
                  <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded-md focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Address line 1</label>
                  <input type="text" value={businessAddress} onChange={e => setBusinessAddress(e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded-md focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">City/State/Zip</label>
                  <input type="text" value={businessCityState} onChange={e => setBusinessCityState(e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded-md focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Contact Number</label>
                  <input type="text" value={businessPhone} onChange={e => setBusinessPhone(e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded-md focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Business Email</label>
                  <input type="text" value={businessEmail} onChange={e => setBusinessEmail(e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded-md focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">State & State Code</label>
                  <input type="text" value={businessState} onChange={e => setBusinessState(e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded-md focus:border-blue-500 outline-none" />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-150 pb-2 mb-3">1.5 Customer (Bill To)</h4>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Customer Name</label>
                  <input type="text" value={custName} onChange={e => setCustName(e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded-md focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Mobile Number</label>
                  <input type="text" value={custPhone} onChange={e => setCustPhone(e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded-md focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Address</label>
                  <textarea rows={2} value={custAddress} onChange={e => setCustAddress(e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded-md focus:border-blue-500 outline-none resize-none" />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-150 pb-2 mb-3">2. Invoice Metadata</h4>
              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Invoice No.</label>
                    <input type="text" value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded-md focus:border-blue-500 outline-none font-bold" />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Date</label>
                    <input type="text" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded-md focus:border-blue-500 outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Place of Supply</label>
                    <input type="text" value={placeOfSupply} onChange={e => setPlaceOfSupply(e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded-md focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Transporter</label>
                    <input type="text" value={transporterName} onChange={e => setTransporterName(e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded-md focus:border-blue-500 outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Vehicle No.</label>
                    <input type="text" value={vehicleNumber} onChange={e => setVehicleNumber(e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded-md focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Delivery Loc.</label>
                    <input type="text" value={deliveryLocation} onChange={e => setDeliveryLocation(e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded-md focus:border-blue-500 outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Deliv Note Date</label>
                    <input type="text" value={deliveryNoteDate} onChange={e => setDeliveryNoteDate(e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded-md focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Buyer Order No.</label>
                    <input type="text" value={buyersOrderNo} onChange={e => setBuyersOrderNo(e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded-md focus:border-blue-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Dated</label>
                  <input type="text" value={datedField} onChange={e => setDatedField(e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded-md focus:border-blue-500 outline-none" />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-150 pb-2 mb-3">3. GST & Balances</h4>
              <div className="space-y-3 text-xs">
                {/* GST Toggle */}
                <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className={`p-1 rounded-md ${gstEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-400'}`}>
                      <Percent className="w-4.5 h-4.5" />
                    </div>
                    <span className="font-bold text-slate-700">Calculate GST</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={gstEnabled} 
                    onChange={e => setGstEnabled(e.target.checked)} 
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                </div>
                
                {gstEnabled && (
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">GST Rate (%)</label>
                    <input type="number" min="0" value={gstPercentage} onChange={e => setGstPercentage(Number(e.target.value))} className="w-full px-2 py-1.5 border border-slate-200 rounded-md focus:border-blue-500 outline-none" />
                  </div>
                )}

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Amount Received (₹)</label>
                  <input type="number" min="0" value={amountReceived} onChange={e => setAmountReceived(Number(e.target.value))} className="w-full px-2 py-1.5 border border-slate-200 rounded-md focus:border-blue-500 outline-none" />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Previous Balance (₹)</label>
                  <input type="number" value={previousBalance} onChange={e => setPreviousBalance(Number(e.target.value))} className="w-full px-2 py-1.5 border border-slate-200 rounded-md focus:border-blue-500 outline-none" />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Payment Mode</label>
                  <input type="text" value={paymentMode} onChange={e => setPaymentMode(e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded-md focus:border-blue-500 outline-none" />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Terms & Conditions</label>
                  <textarea rows={2} value={termsAndConditions} onChange={e => setTermsAndConditions(e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded-md focus:border-blue-500 outline-none resize-none" />
                </div>

                {onCollectPayment && balance > 0 && (
                  <div className="pt-2">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-150 pb-2 mb-3">4. Actions</h4>
                    <button 
                      onClick={onCollectPayment}
                      className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all active:scale-95 shadow-md flex items-center justify-center gap-1.5 font-bold"
                    >
                      <Check className="w-4 h-4" /> Collect Payment / Settle
                    </button>
                  </div>
                )}
              </div>
            </div>

            {recordId && (
              <div className="pt-4 border-t border-slate-200 shrink-0">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-150 pb-2 mb-3">4. Save Changes</h4>
                <button 
                  onClick={handleSavePermanentChanges}
                  disabled={isSaving}
                  className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-lg transition-all active:scale-95 shadow-md flex items-center justify-center gap-1.5 uppercase font-bold"
                >
                  {isSaving ? "Saving Changes..." : "Save Bill Changes"}
                </button>
              </div>
            )}
          </div>

          {/* Right Side - Invoice Preview Box */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center bg-slate-100">
            <div 
              id="print-area" 
              className="bg-white w-[210mm] min-h-[297mm] p-6 text-black border border-black shadow-lg font-mono text-[11px] leading-relaxed relative flex flex-col justify-between"
            >
              <div>
                {/* Upper Centered Invoice Title */}
                <div className="text-center font-bold text-sm tracking-wider uppercase border-b border-black pb-1.5 mb-2">
                  Invoice
                </div>

                {/* Grid Container for Header Details */}
                <div className="grid grid-cols-12 border border-black">
                  
                  {/* Left Column: Business details */}
                  <div className="col-span-7 p-3 border-r border-black flex items-start gap-3">
                    {/* Business Name and Address details */}
                    <div className="leading-normal">
                      <h2 className="text-[13px] font-bold text-black uppercase tracking-wide leading-tight">{businessName}</h2>
                      <p className="mt-1 text-black font-semibold">{businessAddress}</p>
                      <p className="text-black font-semibold">{businessCityState}</p>
                      <p className="mt-1 font-semibold text-black">Phone no.: {businessPhone}</p>
                      <p className="font-semibold text-black">Email: {businessEmail}</p>
                      <p className="font-semibold text-black">State: {businessState}</p>
                    </div>
                  </div>

                  {/* Right Column: Metadata details */}
                  <div className="col-span-5 grid grid-rows-5 divide-y divide-black text-[10px]">
                    <div className="grid grid-cols-2 divide-x divide-black p-1.5">
                      <div>
                        <span className="text-[9px] text-slate-500 block">Invoice No.</span>
                        <strong className="text-black">{invoiceNo}</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block">Date</span>
                        <strong className="text-black">{invoiceDate}</strong>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 divide-x divide-black p-1.5">
                      <div>
                        <span className="text-[9px] text-slate-500 block">Place of Supply</span>
                        <strong className="text-black">{placeOfSupply}</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block">Transporter name</span>
                        <span className="text-black font-semibold">{transporterName || "—"}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 divide-x divide-black p-1.5">
                      <div>
                        <span className="text-[9px] text-slate-500 block">Vehicle number</span>
                        <span className="text-black font-semibold">{vehicleNumber || "—"}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block">Delivery Location</span>
                        <span className="text-black font-semibold">{deliveryLocation || "—"}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 divide-x divide-black p-1.5">
                      <div>
                        <span className="text-[9px] text-slate-500 block">Delivery Note Date</span>
                        <span className="text-black font-semibold">{deliveryNoteDate || "—"}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block">Buyer's Order No.</span>
                        <span className="text-black font-semibold">{buyersOrderNo || "—"}</span>
                      </div>
                    </div>
                    <div className="p-1.5">
                      <span className="text-[9px] text-slate-500 block">Dated</span>
                      <span className="text-black font-semibold">{datedField || "—"}</span>
                    </div>
                  </div>
                </div>

                {/* Bill To Section */}
                <div className="border border-t-0 border-black p-3 bg-slate-50/30">
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest block font-bold mb-1">Bill To</span>
                  <h3 className="text-xs font-bold text-black uppercase tracking-wide leading-none">{custName}</h3>
                  <p className="mt-1.5 text-black font-semibold text-xs leading-normal">{custAddress}</p>
                  {custPhone && <p className="mt-1 text-slate-600 font-semibold">Ph: {custPhone}</p>}
                </div>

                {/* Line Items Table */}
                <table className="w-full border border-t-0 border-black text-[10px] border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-black text-left font-bold text-black">
                      <th className="py-2 px-3 border-r border-black w-[8%] text-center">Sr.</th>
                      <th className="py-2 px-3 border-r border-black w-[47%]">Item name</th>
                      <th className="py-2 px-3 border-r border-black w-[10%] text-center">Quantity</th>
                      <th className="py-2 px-3 border-r border-black w-[10%] text-center">Unit</th>
                      <th className="py-2 px-3 border-r border-black w-[12%] text-right">Price/ unit</th>
                      <th className="py-2 px-3 w-[13%] text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black">
                    {items.map((item, idx) => (
                      <tr key={idx} className="text-black font-semibold">
                        <td className="py-2 px-3 border-r border-black text-center">{idx + 1}</td>
                        <td className="py-2 px-3 border-r border-black uppercase">{item.name}</td>
                        <td className="py-2 px-3 border-r border-black text-center">{item.qty}</td>
                        <td className="py-2 px-3 border-r border-black text-center">{item.unit || "Pcs"}</td>
                        <td className="py-2 px-3 border-r border-black text-right">₹ {item.price.toLocaleString("en-IN")}</td>
                        <td className="py-2 px-3 text-right">₹ {item.amount.toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                    {/* Fill blank rows to reach traditional print depth */}
                    {Array.from({ length: Math.max(0, 5 - items.length) }).map((_, idx) => (
                      <tr key={`empty-${idx}`} className="h-6">
                        <td className="border-r border-black"></td>
                        <td className="border-r border-black"></td>
                        <td className="border-r border-black"></td>
                        <td className="border-r border-black"></td>
                        <td className="border-r border-black"></td>
                        <td></td>
                      </tr>
                    ))}
                    {/* Total Row */}
                    <tr className="bg-slate-50/20 font-bold text-black border-t border-black">
                      <td className="py-2 px-3 border-r border-black"></td>
                      <td className="py-2 px-3 border-r border-black text-right uppercase">Total</td>
                      <td className="py-2 px-3 border-r border-black text-center">
                        {items.reduce((s, i) => s + i.qty, 0)}
                      </td>
                      <td className="py-2 px-3 border-r border-black text-center"></td>
                      <td className="py-2 px-3 border-r border-black"></td>
                      <td className="py-2 px-3 text-right font-black">
                        ₹ {calcSubtotal.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Bottom section layout */}
                <div className="grid grid-cols-12 border border-t-0 border-black divide-x divide-black">
                  
                  {/* Left Column: Words, Terms */}
                  <div className="col-span-7 p-3 flex flex-col justify-between space-y-5">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase font-bold block mb-1">Invoice Amount In Words</span>
                      <strong className="text-black text-[11px] tracking-wide italic">
                        {numberToWords(grandTotal)}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[9px] text-slate-500 uppercase font-bold block mb-1">Payment Mode</span>
                      <strong className="text-black uppercase">{paymentMode}</strong>
                    </div>

                    <div>
                      <span className="text-[9px] text-slate-500 uppercase font-bold block mb-1">Terms and conditions</span>
                      <p className="text-slate-600 font-semibold leading-relaxed">
                        {termsAndConditions}
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Calculations */}
                  <div className="col-span-5 divide-y divide-black font-semibold text-[10px]">
                    <div className="p-2 border-b border-black bg-slate-50/20">
                      <strong className="text-[9px] text-slate-500 uppercase font-bold block">Amounts</strong>
                    </div>
                    <div className="flex justify-between p-2">
                      <span>Sub Total</span>
                      <strong className="text-black">₹ {calcSubtotal.toLocaleString("en-IN")}</strong>
                    </div>
                    {gstEnabled && (
                      <div className="flex justify-between p-2 text-slate-700">
                        <span>GST ({gstPercentage}%)</span>
                        <strong>₹ {gstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>
                      </div>
                    )}
                    <div className="flex justify-between p-2 bg-slate-50/50 font-bold border-b-2 border-black">
                      <span className="text-black uppercase">Total</span>
                      <strong className="text-black text-[11px]">₹ {grandTotal.toLocaleString("en-IN")}</strong>
                    </div>
                    <div className="flex justify-between p-2 text-emerald-700 bg-emerald-50/20">
                      <span>Received</span>
                      <strong className="font-black">₹ {amountReceived.toLocaleString("en-IN")}</strong>
                    </div>
                    <div className="flex justify-between p-2 text-rose-700 bg-rose-50/20">
                      <span>Balance</span>
                      <strong className="font-black">₹ {balance.toLocaleString("en-IN")}</strong>
                    </div>
                    <div className="flex justify-between p-2 text-slate-600">
                      <span>Previous Balance</span>
                      <strong>₹ {Number(previousBalance).toLocaleString("en-IN")}</strong>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-100 font-black border-t border-black text-black">
                      <span>Current Balance</span>
                      <strong className="text-[11px]">₹ {currentBalance.toLocaleString("en-IN")}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Signature Block aligned at the very bottom */}
              <div className="mt-12 flex justify-between items-end border-t border-dashed border-slate-300 pt-4 px-2">
                <div className="text-[9px] text-slate-400 font-medium">
                  Generated via Aman Enterprises Management System
                </div>
                <div className="text-right flex flex-col items-center">
                  <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wide">For {businessName}</span>
                  <div className="h-10"></div> {/* Sign spacing */}
                  <span className="text-[10px] font-black border-t border-black pt-1 px-4 uppercase tracking-wider block">Authorized Signatory</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
