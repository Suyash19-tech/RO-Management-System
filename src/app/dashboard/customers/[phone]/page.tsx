"use client";
import toast from "react-hot-toast";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit2, FileText, User, MapPin, Phone, Calendar, Shield, Settings, Wrench, ChevronRight, Printer, X, Download } from "lucide-react";
import Link from "next/link";
import { InvoiceView, type Appointment } from "@/components/dashboard/AppointmentsTable";
import { AmcInvoiceView } from "@/components/dashboard/AMCTable";
import { UnifiedInvoiceModal } from "@/components/dashboard/UnifiedInvoiceModal";

type ProfileData = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string;
  status: string;
  joinDate: string;
  installations: any[];
  amcs: any[];
  appointments: any[];
};

export default function CustomerProfilePage() {
  const { phone } = useParams();
  const router = useRouter();
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    address: "",
    status: ""
  });
  const [isSaving, setIsSaving] = useState(false);

  // Invoice Modal State
  const [invoiceInst, setInvoiceInst] = useState<any>(null); // The installation to invoice
  const [invoiceApt, setInvoiceApt] = useState<Appointment | null>(null);
  const [invoiceAmc, setInvoiceAmc] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
  }, [phone]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/customers/${encodeURIComponent(phone as string)}`);
      if (!res.ok) throw new Error("Customer not found");
      const data = await res.json();
      setProfile(data);
      setEditForm({
        name: data.name,
        email: data.email || "",
        address: data.address,
        status: data.status
      });
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Confirmation Dialog
    const isConfirmed = window.confirm("Are you sure you want to save these changes to the customer's profile? This action will update all related records.");
    if (!isConfirmed) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/customers/${encodeURIComponent(phone as string)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });
      
      if (!res.ok) throw new Error("Failed to update");
      
      await fetchProfile();
      setIsEditModalOpen(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading customer profile...</div>;
  }

  if (!profile) {
    return (
      <div className="p-8 text-center text-slate-500 flex flex-col items-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Customer Not Found</h2>
        <p className="mb-4">No profile exists for the mobile number: {decodeURIComponent(phone as string)}</p>
        <button onClick={() => router.push('/dashboard/customers')} className="text-[#2563EB] hover:underline font-medium">
          Return to Customers List
        </button>
      </div>
    );
  }

  // Get latest installation for the top header button
  const latestInstallation = profile.installations.length > 0 ? profile.installations[0] : null;

  return (
    <div className="max-w-[1200px] mx-auto pb-10 flex flex-col gap-6">
      
      {/* Dynamic Print Styles targeting ONLY the invoice modal */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            margin: 20mm;
            size: auto;
          }
          body * {
            visibility: hidden;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible;
          }
          #printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: 100%;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}} />

      {/* Header & Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customer Profile</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-bold transition-colors shadow-sm"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </button>
          <button 
            onClick={() => {
              if (latestInstallation) {
                setInvoiceInst(latestInstallation);
              } else {
                toast.error("No installations found to generate an invoice for.");
              }
            }}
            disabled={!latestInstallation}
            className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg text-sm font-bold transition-colors shadow-sm shadow-blue-600/20"
          >
            <FileText className="w-4 h-4" />
            Generate Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Identity & Contact Info */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-[#0B1B3D] h-24 relative">
              <div className="absolute -bottom-10 left-6 w-20 h-20 bg-white rounded-full border-4 border-white flex items-center justify-center text-2xl font-bold text-[#2563EB] shadow-sm">
                {profile.name.substring(0, 2).toUpperCase()}
              </div>
            </div>
            <div className="pt-14 px-6 pb-6">
              <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${profile.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {profile.status}
                </span>
                <span className="text-xs font-medium text-slate-400">ID: {profile.id.split('-')[0] + '-' + profile.id.substring(profile.id.length - 4)}</span>
              </div>
              
              <div className="mt-6 flex flex-col gap-4">
                <div className="flex items-start gap-3 text-sm">
                  <Phone className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">{profile.phone}</p>
                    <p className="text-xs text-slate-500 font-medium">Primary Mobile (Identity)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <User className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">{profile.email || "No email provided"}</p>
                    <p className="text-xs text-slate-500 font-medium">Email Address</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">{profile.address}</p>
                    <p className="text-xs text-slate-500 font-medium">Registered Address</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <Calendar className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">{new Date(profile.joinDate).toLocaleDateString()}</p>
                    <p className="text-xs text-slate-500 font-medium">Customer Since</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Installations, AMCs, Services */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Installations Overview */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#2563EB]" />
                <h3 className="text-lg font-bold text-slate-900">RO Machines Installed</h3>
              </div>
            </div>
            {profile.installations.length === 0 ? (
              <p className="text-sm text-slate-500">No installations recorded for this customer.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {profile.installations.map((inst, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    {/* Header */}
                    <div className="p-4 bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-extrabold text-slate-900">{inst.model}</h4>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${inst.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {inst.status}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">Installed: {new Date(inst.date).toLocaleDateString()}</span>
                          {inst.servicesCount !== undefined && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              {inst.servicesCount} Free Services Left
                            </span>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => setInvoiceInst(inst)}
                        className="px-3 py-1.5 bg-blue-50 text-[#2563EB] hover:bg-blue-100 text-xs font-bold rounded-lg border border-blue-200 transition-colors flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" /> View Invoice
                      </button>
                    </div>

                    {/* Financial Summary */}
                    <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Value</span>
                        <span className="text-sm font-black text-slate-900">₹{inst.totalPrice?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Discount</span>
                        <span className="text-sm font-bold text-red-500">-₹{inst.discount?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Paid ({inst.paymentMethod})</span>
                        <span className="text-sm font-black text-emerald-600">₹{inst.amountPaid?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Balance Due</span>
                        <span className={`text-sm font-black ${inst.amountDue > 0 ? 'text-red-600' : 'text-slate-400'}`}>₹{inst.amountDue?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AMC Details */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-emerald-500" />
              <h3 className="text-lg font-bold text-slate-900">AMC Contracts</h3>
            </div>
            {profile.amcs.length === 0 ? (
              <p className="text-sm text-slate-500">No AMC active for this customer.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {profile.amcs.map((amc, idx) => (
                  <div key={idx} className="flex flex-col gap-3 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-900">{amc.plan}</h4>
                        <p className="text-sm text-slate-500 mt-0.5">ID: {amc.id}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide ${amc.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : amc.status === 'Expired' ? 'bg-rose-100 text-rose-700' : amc.status === 'Renewed' ? 'bg-slate-100 text-slate-500 border border-slate-200' : 'bg-amber-100 text-amber-700'}`}>
                          {amc.status}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide ${amc.payment === 'Paid' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-rose-50 border border-rose-200 text-rose-700'}`}>
                          {amc.payment}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                      <div className="grid grid-cols-2 gap-4 text-sm flex-1">
                        <div>
                          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Issue Date</p>
                          <p className="font-medium text-slate-900 mt-0.5">{new Date(amc.startDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Expiry Date</p>
                          <p className="font-medium text-slate-900 mt-0.5">{new Date(amc.endDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setInvoiceAmc(amc)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5 shrink-0"
                      >
                        <FileText className="w-3.5 h-3.5" /> View Invoice
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Service & Repair History */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Wrench className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-bold text-slate-900">Service History</h3>
            </div>
            {profile.appointments.length === 0 ? (
              <p className="text-sm text-slate-500">No service history.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-100">
                      <th className="pb-2 font-semibold">Date</th>
                      <th className="pb-2 font-semibold">Type</th>
                      <th className="pb-2 font-semibold">Technician</th>
                      <th className="pb-2 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {profile.appointments.map((apt, idx) => (
                      <tr key={idx} className="text-slate-700">
                        <td className="py-3">{new Date(apt.date).toLocaleDateString()}</td>
                        <td className="py-3 font-medium">{apt.type}</td>
                        <td className="py-3">{apt.tech}</td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <span className={`text-xs font-bold ${apt.status === 'Completed' ? 'text-emerald-600' : apt.status === 'Scheduled' ? 'text-[#2563EB]' : 'text-slate-500'}`}>
                              {apt.status}
                            </span>
                            {apt.status === 'Completed' && (
                              <button 
                                onClick={() => setInvoiceApt(apt as Appointment)}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded flex items-center gap-1 transition-colors"
                              >
                                <FileText className="w-3 h-3" /> Invoice
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Edit Customer Profile</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-md text-slate-400">
                 <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  value={editForm.name} 
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})} 
                  required
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-[#2563EB]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Mobile Number (Identity - Uneditable)</label>
                <input 
                  type="text" 
                  value={profile.phone} 
                  disabled
                  className="w-full px-3.5 py-2 border border-slate-100 bg-slate-50 text-slate-400 rounded-lg text-sm font-medium outline-none cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  value={editForm.email} 
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})} 
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-[#2563EB]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Address</label>
                <textarea 
                  value={editForm.address} 
                  onChange={(e) => setEditForm({...editForm, address: e.target.value})} 
                  required
                  rows={2}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-[#2563EB]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Status</label>
                <select 
                  value={editForm.status} 
                  onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-[#2563EB]"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="px-5 py-2 text-sm font-bold text-white bg-[#2563EB] hover:bg-blue-700 disabled:bg-blue-300 rounded-lg transition-colors"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Professional Invoice Modal */}
      {invoiceInst && (
        <UnifiedInvoiceModal
          onClose={() => setInvoiceInst(null)}
          invoiceType="INSTALLATION"
          customerName={profile?.name || ""}
          customerPhone={profile?.phone}
          customerAddress={profile?.address || ""}
          items={(() => {
            const itemsList = [];
            itemsList.push({
              name: `${invoiceInst.model} — Main RO Unit Installation`,
              qty: 1,
              unit: 'Pcs',
              price: invoiceInst.roPrice || 0,
              amount: invoiceInst.roPrice || 0
            });
            if (invoiceInst.equipments && invoiceInst.equipments.length > 0 && invoiceInst.equipments !== "None") {
              itemsList.push({
                name: `Spare Parts: ${invoiceInst.equipments}`,
                qty: 1,
                unit: 'Pcs',
                price: invoiceInst.equipmentPrice || 0,
                amount: invoiceInst.equipmentPrice || 0
              });
            }
            if (invoiceInst.amcPrice > 0) {
              itemsList.push({
                name: `AMC / Service Contract — ${invoiceInst.servicesCount} visits`,
                qty: 1,
                unit: 'Pcs',
                price: invoiceInst.amcPrice || 0,
                amount: invoiceInst.amcPrice || 0
              });
            }
            if (invoiceInst.discount > 0) {
              itemsList.push({
                name: `Discount`,
                qty: 1,
                unit: 'Pcs',
                price: -invoiceInst.discount,
                amount: -invoiceInst.discount
              });
            }
            return itemsList;
          })()}
          subtotal={(invoiceInst.roPrice || 0) + (invoiceInst.equipmentPrice || 0) + (invoiceInst.amcPrice || 0) - (invoiceInst.discount || 0)}
          received={invoiceInst.amountPaid || 0}
          paymentMethod={invoiceInst.paymentMethod || "Cash"}
          date={invoiceInst.date}
          defaultGstEnabled={invoiceInst.totalPrice > ((invoiceInst.roPrice || 0) + (invoiceInst.equipmentPrice || 0) + (invoiceInst.amcPrice || 0) - (invoiceInst.discount || 0) + 1)}
        />
      )}

      {invoiceApt && <InvoiceView apt={invoiceApt} onClose={() => setInvoiceApt(null)} />}
      {invoiceAmc && (
        <AmcInvoiceView 
          amc={invoiceAmc} 
          onClose={() => setInvoiceAmc(null)} 
          onUpdate={() => {
            fetchProfile();
          }} 
        />
      )}
    </div>
  );
}
