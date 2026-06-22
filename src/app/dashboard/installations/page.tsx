"use client";
import toast from "react-hot-toast";

import { useState, useEffect } from "react";
import { Plus, Search, Filter, Download, X, Check, Server, Shield, Cog, Receipt, User as UserIcon, MapPin, IndianRupee, CreditCard, Banknote, Wallet, FileText, ChevronRight, ChevronLeft } from "lucide-react";
import { InstallationsTable } from "@/components/dashboard/InstallationsTable";

type ProductOption = { name: string; price: number };

export default function InstallationsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentStep, setCurrentStep] = useState(1);

  // Dynamic Options from DB
  const [roOptions, setRoOptions] = useState<ProductOption[]>([]);
  const [amcOptions, setAmcOptions] = useState<ProductOption[]>([]);
  const [equipmentOptions, setEquipmentOptions] = useState<ProductOption[]>([]);

  const fetchOptions = () => {
    fetch('/api/form-options')
      .then(res => res.json())
      .then(data => {
        setRoOptions(data.roMachines || []);
        setAmcOptions(data.amcPlans || []);
        setEquipmentOptions(data.equipments ? data.equipments.map((e: any) => ({ name: e.item, price: e.price })) : []);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  // Form State
  const [form, setForm] = useState({
    name: "",
    phone: "",
    altPhone: "",
    address: "",
    modelName: "",
    modelPrice: 0,
    selectedEquipments: [] as ProductOption[],
    amcPlanName: "",
    amcPrice: 0,
    servicesCount: 4,
    expiryDate: "",
    // Billing State
    discount: 0,
    paymentMethod: "Cash",
    amountPaid: 0,
    generateInvoice: true
  });

  const equipmentPriceTotal = form.selectedEquipments.reduce((acc, eq) => acc + eq.price, 0);
  const baseTotal = form.modelPrice + equipmentPriceTotal + form.amcPrice;
  const subTotalAfterDiscount = Math.max(0, baseTotal - (form.discount || 0));
  const gstAmount = subTotalAfterDiscount * 0.18;
  const grandTotal = subTotalAfterDiscount + gstAmount;
  const amountDue = Math.max(0, grandTotal - (form.amountPaid || 0));

  const handleRoSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = roOptions.find(ro => ro.name === e.target.value);
    setForm(prev => ({ ...prev, modelName: selected?.name || "", modelPrice: selected?.price || 0 }));
  };

  const handleAmcSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = amcOptions.find(amc => amc.name === e.target.value);
    if (!selected) {
      setForm(prev => ({ ...prev, amcPlanName: "", amcPrice: 0, expiryDate: "", servicesCount: 4 }));
      return;
    }
    
    // Auto calculate expiry 1 year from now
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const dateString = nextYear.toISOString().split('T')[0];

    let sCount = 4;
    if (selected.name.includes("Premium") || selected.name.includes("2-Year")) sCount = 4;

    setForm(prev => ({ 
      ...prev, 
      amcPlanName: selected.name, 
      amcPrice: selected.price,
      expiryDate: dateString,
      servicesCount: sCount
    }));
  };

  const toggleEquipment = (eq: ProductOption) => {
    setForm(prev => {
      const isSelected = prev.selectedEquipments.some(e => e.name === eq.name);
      if (isSelected) {
        return { ...prev, selectedEquipments: prev.selectedEquipments.filter(e => e.name !== eq.name) };
      } else {
        return { ...prev, selectedEquipments: [...prev.selectedEquipments, eq] };
      }
    });
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!form.name || !form.phone || !form.address) {
        toast.error("Please fill in Name, Phone, and Address before proceeding.");
        return;
      }
    }
    if (currentStep === 2) {
      if (!form.modelName) {
        toast.error("Please select an RO Machine before proceeding.");
        return;
      }
      // Auto-fill amount paid to total if moving to step 3 initially
      if (form.amountPaid === 0 && grandTotal > 0) {
         setForm(prev => ({ ...prev, amountPaid: grandTotal }));
      }
    }
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.name || !form.phone || !form.address || !form.modelName) {
      toast.error("Missing required fields.");
      return;
    }

    setSubmitting(true);
    
    const payload = {
      name: form.name,
      phone: form.phone,
      altPhone: form.altPhone,
      address: form.address,
      model: form.modelName,
      equipments: form.selectedEquipments.map(e => e.name).join(", "),
      amcPlan: form.amcPlanName,
      roPrice: form.modelPrice,
      equipmentPrice: equipmentPriceTotal,
      amcPrice: form.amcPrice,
      discount: form.discount || 0,
      totalPrice: grandTotal,
      amountPaid: form.amountPaid || 0,
      amountDue: amountDue,
      paymentMethod: form.paymentMethod,
      servicesCount: form.servicesCount,
      expiryDate: form.expiryDate
    };

    try {
      const res = await fetch('/api/installations/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to onboard customer");

      if (form.generateInvoice) {
         console.log("Invoice Generation Triggered for:", form.name);
         const paidAmt = form.amountPaid || grandTotal;
         const dueAmt = Math.max(0, grandTotal - paidAmt);
         const msg = dueAmt > 0
           ? `Customer Onboarded! ₹${paidAmt.toFixed(2)} collected. Balance due: ₹${dueAmt.toFixed(2)}`
           : `Customer Onboarded! Full payment of ₹${paidAmt.toFixed(2)} collected.`;
         toast.success(msg);
      } else {
         toast.success("Customer Onboarded Successfully!");
      }

      // Reset form
      setForm({
        name: "", phone: "", altPhone: "", address: "",
        modelName: "", modelPrice: 0,
        selectedEquipments: [],
        amcPlanName: "", amcPrice: 0,
        servicesCount: 4, expiryDate: "",
        discount: 0, paymentMethod: "Cash", amountPaid: 0, generateInvoice: true
      });
      setIsModalOpen(false);
      setCurrentStep(1);
      setRefreshKey(prev => prev + 1);
      fetchOptions();
    } catch (err) {
      console.error(err);
      toast.error("Failed to onboard customer.");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper for rendering payment icons
  const PaymentIcon = ({ method, className }: { method: string, className?: string }) => {
    if (method === "Cash") return <Banknote className={className || "w-4 h-4"} />;
    if (method === "Card") return <CreditCard className={className || "w-4 h-4"} />;
    if (method === "UPI") return <Wallet className={className || "w-4 h-4"} />;
    return <Banknote className={className || "w-4 h-4"} />;
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto pb-10 h-full relative">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Installations HQ</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Deploy machines, assign technicians, and onboard customers in real-time.</p>
        </div>
      </div>

      {/* BIG ONBOARDING BUTTON */}
      <div 
        role="button"
        tabIndex={0}
        onClick={() => { setIsModalOpen(true); setCurrentStep(1); }}
        className="w-full min-h-[220px] sm:min-h-[240px] bg-[#0B1B3D] hover:bg-slate-900 text-white py-10 sm:py-16 px-5 sm:px-10 rounded-3xl shadow-2xl shadow-slate-900/20 flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-10 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer border border-[#2563EB]/40 group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#2563EB]/20 to-transparent opacity-60" />
        
        <div className="bg-[#2563EB] p-4 sm:p-6 rounded-full shadow-lg group-hover:rotate-90 transition-transform duration-500 relative z-10 flex items-center justify-center shrink-0">
          <Plus className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
        </div>
        
        <div className="text-center sm:text-left relative z-10 flex flex-col justify-center">
          <h2 className="text-[22px] sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase drop-shadow-sm leading-tight">ONBOARD NEW RO CUSTOMER</h2>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-5 mt-2 sm:mt-4 text-blue-100 font-bold text-xs sm:text-base">
            <span className="flex items-center gap-1.5 sm:gap-2"><Check className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#2563EB]" /> Auto-creates Profile</span>
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-slate-600 hidden sm:block" />
            <span className="flex items-center gap-1.5 sm:gap-2"><Check className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#2563EB]" /> Point of Sale Billing</span>
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-slate-600 hidden sm:block" />
            <span className="flex items-center gap-1.5 sm:gap-2"><Check className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#2563EB]" /> Generates AMC</span>
          </div>
        </div>
      </div>

      {/* Toolbar for Recent Installations */}
      <div className="mt-8 flex flex-col gap-3">
        <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Server className="w-5 h-5 text-blue-600" /> 
          Recent Field Operations
        </h3>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
          <div className="relative w-full sm:max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter installations..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-bold shadow-sm">
              <Filter className="w-4 h-4 text-slate-500" /> Filter
            </button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="flex-1 mt-2">
        <InstallationsTable key={refreshKey} searchTerm={searchTerm} />
      </div>

      {/* 3-STEP WIZARD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0B1B3D]/80 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 relative">
            
            {/* Modal Header & Close */}
            <div className="px-6 py-5 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Onboard Customer</h2>
                <p className="text-[11px] font-bold text-blue-600 mt-1 uppercase tracking-widest">Installation & Billing Wizard</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors active:scale-90">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper / Ledger UI */}
            <div className="bg-slate-50 px-6 py-5 border-b border-slate-200 shrink-0">
              <div className="flex items-start justify-between max-w-md mx-auto">
                {[
                  { num: 1, label: "Profile" },
                  { num: 2, label: "Hardware" },
                  { num: 3, label: "Checkout" }
                ].map((step, index) => (
                  <div key={step.num} className="relative z-10 flex flex-col items-center flex-1">
                    
                    {/* Connecting Line (except for first item) */}
                    {index !== 0 && (
                      <div className="absolute right-[calc(50%+16px)] left-[calc(-50%+16px)] top-4 -translate-y-1/2 h-[3px] bg-slate-200 overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 transition-all duration-700 ease-in-out" 
                          style={{ width: currentStep >= step.num ? '100%' : '0%' }}
                        />
                      </div>
                    )}
                    
                    {/* Circle */}
                    <div className={`relative w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 z-10 ${
                      currentStep > step.num 
                        ? 'bg-blue-600 text-white scale-100' // Completed
                        : currentStep === step.num
                        ? 'bg-blue-600 text-white shadow-[0_0_0_6px_rgba(37,99,235,0.15)] shadow-blue-600/30 scale-110' // Active & Glowing
                        : 'bg-white text-slate-400 border-2 border-slate-200 scale-100' // Pending
                    }`}>
                      {currentStep > step.num ? <Check className="w-4 h-4" /> : step.num}
                    </div>
                    
                    {/* Label */}
                    <span className={`mt-2 text-[10px] font-bold uppercase tracking-wider transition-colors duration-500 ${
                      currentStep === step.num ? 'text-blue-700' : currentStep > step.num ? 'text-slate-800' : 'text-slate-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 bg-white">
              
              {/* STEP 1: CUSTOMER PROFILE */}
              {currentStep === 1 && (
                <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <UserIcon className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest">Phase 1: Customer Identity</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name *</label>
                      <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:font-medium placeholder:text-slate-400" placeholder="E.g. Vikram Singh" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Mobile No. (Identity) *</label>
                      <input type="tel" required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:font-medium placeholder:text-slate-400" placeholder="+91 99999 00000" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><MapPin className="w-3 h-3"/> Installation Address *</label>
                      <textarea required rows={2} value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all resize-none placeholder:font-medium placeholder:text-slate-400" placeholder="Complete address including landmarks..." />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: HARDWARE & AMC */}
              {currentStep === 2 && (
                <div className="flex flex-col gap-8 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex flex-col gap-5">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <Cog className="w-5 h-5 text-slate-800" />
                      <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest">Phase 2: Hardware Installed</h3>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Select RO Machine *</label>
                      <select required value={form.modelName} onChange={handleRoSelection} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer">
                        <option value="" disabled>-- Choose RO Model --</option>
                        {roOptions.map(ro => (
                          <option key={ro.name} value={ro.name}>{ro.name} - ₹{ro.price.toLocaleString()}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Extra Equipments / Parts Sold</label>
                      <div className="flex flex-wrap gap-2">
                        {equipmentOptions.map(eq => {
                          const isSelected = form.selectedEquipments.some(e => e.name === eq.name);
                          return (
                            <button 
                              type="button" 
                              key={eq.name} 
                              onClick={() => toggleEquipment(eq)}
                              className={`px-3 py-2 border rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${isSelected ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                            >
                              {isSelected && <Check className="w-3 h-3" />}
                              {eq.name} <span className="opacity-60 ml-1">(₹{eq.price})</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-5">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest">Service & Warranty (AMC)</h3>
                    </div>
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                      <label className="block text-[11px] font-bold text-blue-700 uppercase tracking-wider mb-2">Add AMC Plan (Auto-Generates Contract)</label>
                      <select value={form.amcPlanName} onChange={handleAmcSelection} className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl text-sm font-bold text-blue-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer shadow-sm">
                        <option value="">No AMC Plan added upfront</option>
                        {amcOptions.map(amc => (
                          <option key={amc.name} value={amc.name}>{amc.name} - ₹{amc.price.toLocaleString()}</option>
                        ))}
                      </select>

                      {form.amcPlanName && (
                        <div className="mt-4 grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                          <div className="bg-white p-3 rounded-xl border border-blue-100 flex flex-col gap-1 shadow-sm">
                            <span className="text-[10px] font-bold text-blue-600 uppercase">Included Services</span>
                            <span className="text-lg font-black text-slate-900">{form.servicesCount} Visits</span>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-blue-100 flex flex-col gap-1 shadow-sm">
                            <span className="text-[10px] font-bold text-blue-600 uppercase">Warranty Expiry</span>
                            <span className="text-sm font-bold text-slate-900 mt-1">{new Date(form.expiryDate).toLocaleDateString('en-GB')}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: BILLING & CHECKOUT */}
              {currentStep === 3 && (
                <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                       <Receipt className="w-5 h-5 text-blue-600" />
                       <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest">Phase 3: Billing & Finance</h3>
                    </div>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer hover:text-blue-600 transition-colors">
                      <input type="checkbox" checked={form.generateInvoice} onChange={e => setForm({...form, generateInvoice: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500" />
                      <FileText className="w-4 h-4" /> Gen Invoice
                    </label>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl flex flex-col gap-3 border border-slate-200">
                     <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                       <span>Base Total</span>
                       <span>₹{baseTotal.toLocaleString()}</span>
                     </div>
                     
                     <div className="flex justify-between items-center group">
                       <span className="text-xs font-bold text-red-500">Discount (₹)</span>
                       <div className="relative">
                         <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-red-500">-₹</span>
                         <input 
                           type="number" 
                           min="0"
                           value={form.discount || ""}
                           onChange={(e) => setForm({...form, discount: Number(e.target.value)})}
                           className="w-24 pl-6 pr-2 py-1 text-xs font-bold text-red-500 bg-white border border-red-200 rounded-lg text-right outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/20"
                           placeholder="0"
                         />
                       </div>
                     </div>

                     <div className="flex justify-between items-center text-xs font-bold text-slate-600 pt-2 border-t border-slate-200 border-dashed">
                       <span>Subtotal</span>
                       <span>₹{subTotalAfterDiscount.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                       <span>GST (18%)</span>
                       <span>₹{gstAmount.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
                     </div>
                     
                     <div className="flex justify-between items-center text-sm font-black text-slate-900 pt-3 border-t border-slate-300">
                       <span className="uppercase tracking-widest text-slate-600 text-xs">Grand Total</span>
                       <span className="text-xl">₹{grandTotal.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
                     </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <h4 className="text-[11px] font-extrabold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2">Payment Collection</h4>
                    
                    <div className="grid grid-cols-3 gap-3">
                      {["Cash", "UPI", "Card"].map(method => (
                         <button
                           key={method}
                           type="button"
                           onClick={() => setForm({...form, paymentMethod: method})}
                           className={`py-3 flex flex-col items-center justify-center gap-2 rounded-xl border text-sm font-bold transition-all ${form.paymentMethod === method ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                         >
                           <PaymentIcon method={method} className="w-5 h-5" />
                           {method}
                         </button>
                      ))}
                    </div>

                    <div className="flex sm:items-center flex-col sm:flex-row justify-between gap-3 mt-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                       <span className="text-sm font-bold text-slate-700">Amount Paid Now</span>
                       <div className="relative">
                         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-900">₹</span>
                         <input 
                           type="number" 
                           min="0"
                           value={form.amountPaid || ""}
                           onChange={(e) => setForm({...form, amountPaid: Number(e.target.value)})}
                           className="w-full sm:w-40 pl-8 pr-4 py-3 text-lg font-black text-slate-900 bg-slate-50 border border-slate-300 rounded-xl text-right outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                           placeholder={grandTotal.toFixed(0)}
                         />
                       </div>
                     </div>

                     {amountDue > 0 && (
                       <div className="flex justify-between items-center px-4 py-3 bg-red-50 text-red-700 rounded-xl border border-red-100 animate-in slide-in-from-top-1">
                         <span className="text-xs font-bold uppercase tracking-wider">Balance Due</span>
                         <span className="text-sm font-black">₹{amountDue.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                       </div>
                     )}
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Actions Footer */}
            <div className="bg-white border-t border-slate-100 p-4 sm:p-6 shrink-0 flex items-center justify-between gap-4">
              {currentStep > 1 ? (
                <button 
                  type="button" 
                  onClick={prevStep}
                  className="px-4 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" /> Back
                </button>
              ) : (
                <div /> // Spacer
              )}

              {currentStep < 3 ? (
                <button 
                  type="button" 
                  onClick={nextStep}
                  className="px-6 py-3 rounded-xl font-black text-white bg-[#2563EB] hover:bg-blue-600 transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95"
                >
                  Next Phase <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button 
                  type="button" 
                  onClick={() => handleSubmit()}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 rounded-xl font-black text-white bg-emerald-600 hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-70 disabled:scale-100 text-lg uppercase tracking-wider"
                >
                  {submitting ? "Processing..." : "Confirm & Save Customer"}
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
