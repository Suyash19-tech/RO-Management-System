"use client";

import { Download, X } from "lucide-react";

export function ServiceInvoiceModal({ ticket, profile, onClose }: { ticket: any; profile: any; onClose: () => void }) {
  const items = ticket.partsReplaced || [];
  const total = ticket.costCharged || 0;
  const invoiceNo = `SVC-${ticket.id.split('-')[1] || ticket.id.slice(-8).toUpperCase()}-${new Date(ticket.completedAt || ticket.createdAt).getFullYear()}`;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-sm overflow-y-auto p-4 sm:p-8 flex items-center">
      <style dangerouslySetInnerHTML={{ __html: `@media print { @page { margin:15mm; size:A4; } body *{visibility:hidden} #svc-printable,#svc-printable *{visibility:visible} #svc-printable{position:absolute;left:0;top:0;width:100%;background:white!important;box-shadow:none!important;border:none!important;padding:0!important;margin:0!important} .no-print{display:none!important} }` }} />
      <div className="w-full max-w-3xl mx-auto flex flex-col gap-4 my-2 sm:my-8 max-h-full">
        <div className="no-print flex justify-end gap-2 shrink-0">
          <button onClick={() => window.print()} className="flex-1 sm:flex-none justify-center px-5 py-3.5 sm:py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-lg flex items-center gap-2 transition-colors">
            <Download className="w-4 h-4" /> Save as PDF / Print
          </button>
          <button onClick={onClose} className="p-3 bg-white hover:bg-slate-100 text-slate-600 rounded-xl shadow-lg transition-colors flex items-center justify-center shrink-0"><X className="w-5 h-5" /></button>
        </div>

        <div id="svc-printable" className="bg-white w-full rounded-xl shadow-2xl p-6 sm:p-12 border border-slate-200 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b-2 border-black pb-6 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">SARDARJI RO</h1>
              <p className="text-slate-600 mt-1 text-sm font-medium">Pure Water Solutions & AMC Experts</p>
              <p className="text-slate-600 text-sm mt-0.5">Delhi NCR Region, India</p>
              <p className="text-slate-600 text-sm font-medium mt-0.5">GSTIN: 07ABCDE1234F1Z5</p>
            </div>
            <div className="text-left sm:text-right">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-200 uppercase tracking-widest">Invoice</h2>
              <p className="text-slate-900 font-bold mt-2">{invoiceNo}</p>
              <p className="text-slate-600 font-medium text-sm">Date: {new Date(ticket.completedAt || ticket.createdAt).toLocaleDateString("en-IN")}</p>
              <div className="mt-2">
                {ticket.paymentStatus === "Free" ? <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full uppercase">Free Service</span>
                  : ticket.paymentStatus === "Paid" ? <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full uppercase">Paid</span>
                  : <span className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-full uppercase">Unpaid</span>}
              </div>
            </div>
          </div>

          {/* Bill To */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-10">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Billed To</p>
              <h3 className="text-lg font-bold text-black">{profile.name}</h3>
              <p className="text-slate-600 font-medium text-sm mt-1">{profile.address}</p>
              <p className="text-slate-600 font-medium text-sm mt-0.5">Ph: {profile.phone}</p>
            </div>
            <div className="text-left sm:text-right w-full sm:w-auto p-4 sm:p-0 bg-slate-50 sm:bg-transparent rounded-lg border border-slate-100 sm:border-0">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Service Details</p>
              <p className="text-slate-900 font-bold text-sm">{ticket.issueType}</p>
              <p className="text-slate-600 font-medium text-sm mt-0.5"><span className="text-slate-500">Technician:</span> {ticket.technician?.name || "Unassigned"}</p>
              <p className="text-slate-600 font-medium text-sm mt-0.5"><span className="text-slate-500">Ticket:</span> {ticket.id}</p>
              <p className="text-slate-600 font-medium text-sm mt-0.5"><span className="text-slate-500">Payment:</span> {ticket.paymentStatus || "—"}</p>
            </div>
          </div>

          {/* Items */}
          <table className="w-full mb-8">
            <thead><tr className="border-b-2 border-black text-left">
              <th className="py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Item Description</th>
              <th className="py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-16">Qty</th>
              <th className="py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right w-32">Amount</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-200">
              {items.length === 0 ? (
                <tr>
                  <td className="py-4"><p className="font-bold text-black">{ticket.issueType} — Service Visit</p><p className="text-xs text-slate-500 mt-1">On-site service by {ticket.technician?.name || "Technician"}</p></td>
                  <td className="py-4 text-center font-bold text-black">1</td>
                  <td className="py-4 text-right font-bold text-black">₹{total.toLocaleString("en-IN")}</td>
                </tr>
              ) : (<>
                <tr>
                  <td className="py-4"><p className="font-bold text-black">{ticket.issueType} — Service Visit</p><p className="text-xs text-slate-500 mt-1">On-site service by {ticket.technician?.name || "Technician"}</p></td>
                  <td className="py-4 text-center font-bold text-black">1</td>
                  <td className="py-4 text-right text-slate-400">—</td>
                </tr>
                {items.map((item: any, i: number) => (
                  <tr key={i}>
                    <td className="py-4 pl-4"><p className="font-medium text-black">{item.name}</p><p className="text-xs text-slate-500 mt-0.5">Part / Material</p></td>
                    <td className="py-4 text-center text-slate-700 font-semibold">{item.quantity || item.qty}</td>
                    <td className="py-4 text-right font-bold text-black">₹{((item.cost || 0) * (item.quantity || item.qty || 1)).toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </>)}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-10">
            <div className="w-full sm:w-72 flex flex-col gap-3">
              <div className="flex justify-between text-sm text-slate-600 font-medium"><span>Subtotal</span><span className="font-bold text-black">₹{total.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between text-sm text-slate-600 font-medium border-b border-slate-300 pb-3"><span>GST / Tax</span><span className="text-slate-500">Included</span></div>
              <div className="flex justify-between text-lg font-black text-black pt-1"><span>Total</span><span>₹{total.toLocaleString("en-IN")}</span></div>
              {ticket.paymentStatus === "Paid" && <div className="flex justify-between text-sm text-black bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg"><span className="font-bold">Amount Paid</span><span className="font-black">₹{total.toLocaleString("en-IN")}</span></div>}
              {ticket.paymentStatus === "Unpaid" && <div className="flex justify-between text-sm text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2 rounded-lg"><span className="font-bold">Balance Due</span><span className="font-black">₹{total.toLocaleString("en-IN")}</span></div>}
              {ticket.paymentStatus === "Free" && <div className="flex justify-between text-sm text-slate-600 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg"><span className="font-bold">Warranty / Free Visit</span><span className="font-black">₹0</span></div>}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-8 text-center">
            <p className="text-black font-bold">Thank you for choosing Sardar Ji RO!</p>
            <p className="text-slate-500 font-medium text-xs mt-1">For queries, contact your nearest Sardar Ji RO service center.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function InstallationInvoiceModal({ installation, profile, onClose }: { installation: any; profile: any; onClose: () => void }) {
  const invoiceNo = `INV-${installation.id.substring(installation.id.length - 8).toUpperCase()}-${new Date(installation.date).getFullYear()}`;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-sm overflow-y-auto p-4 sm:p-8 flex items-center">
      <style dangerouslySetInnerHTML={{ __html: `@media print { @page { margin:15mm; size:A4; } body *{visibility:hidden} #printable-invoice,#printable-invoice *{visibility:visible} #printable-invoice{position:absolute;left:0;top:0;width:100%;background:white!important;box-shadow:none!important;border:none!important;padding:0!important;margin:0!important} .no-print{display:none!important} }` }} />
      <div className="w-full max-w-3xl mx-auto flex flex-col gap-4 my-2 sm:my-8 max-h-full">
        <div className="no-print flex justify-end gap-2 shrink-0">
          <button onClick={() => window.print()} className="flex-1 sm:flex-none justify-center px-5 py-3.5 sm:py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-lg flex items-center gap-2 transition-colors">
            <Download className="w-4 h-4" /> Save as PDF / Print
          </button>
          <button onClick={onClose} className="p-3 bg-white hover:bg-slate-100 text-slate-600 rounded-xl shadow-lg transition-colors flex items-center justify-center shrink-0"><X className="w-5 h-5" /></button>
        </div>

        <div id="printable-invoice" className="bg-white w-full rounded-xl shadow-2xl p-5 sm:p-12 border border-slate-200 overflow-y-auto mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-6 sm:pb-8 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">SARDARJI RO</h1>
              <p className="text-slate-600 mt-1 text-sm font-medium">Pure Water Solutions & AMC Experts</p>
              <p className="text-slate-600 text-sm mt-1">Delhi NCR Region, India</p>
              <p className="text-slate-600 text-sm font-medium mt-1">GSTIN: 07ABCDE1234F1Z5</p>
            </div>
            <div className="text-left sm:text-right w-full sm:w-auto">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-200 uppercase tracking-widest">Invoice</h2>
              <p className="text-slate-900 font-bold mt-2">{invoiceNo}</p>
              <p className="text-slate-600 font-medium text-sm">Date: {new Date(installation.date).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8 sm:mb-10">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Billed To</p>
              <h3 className="text-lg font-bold text-black">{profile.name}</h3>
              <p className="text-slate-600 font-medium text-sm mt-1">{profile.address}</p>
              <p className="text-slate-600 font-medium text-sm mt-0.5">Ph: {profile.phone}</p>
            </div>
            <div className="text-left sm:text-right w-full sm:w-auto p-4 sm:p-0 bg-slate-50 sm:bg-transparent rounded-lg border border-slate-100 sm:border-0">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Payment Details</p>
              <p className="text-slate-900 font-bold text-sm"><span className="text-slate-500 font-medium">Method:</span> {installation.paymentMethod}</p>
              <p className="text-slate-900 font-bold text-sm mt-0.5"><span className="text-slate-500 font-medium">Status:</span> {installation.amountDue > 0 ? 'Partial Payment' : 'Paid in Full'}</p>
            </div>
          </div>

          <table className="w-full mb-8">
            <thead>
              <tr className="border-b-2 border-black text-left">
                <th className="py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Item Description</th>
                <th className="py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right w-32">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="py-4">
                  <p className="font-bold text-black">{installation.model}</p>
                  <p className="text-xs font-medium text-slate-500 mt-1">Main RO Unit Installation</p>
                </td>
                <td className="py-4 text-right font-bold text-black">₹{installation.roPrice?.toLocaleString() || 0}</td>
              </tr>
              {installation.equipments && installation.equipments.length > 0 && installation.equipments !== "None" && (
                <tr>
                  <td className="py-4">
                    <p className="font-bold text-black">Extra Equipments / Spare Parts</p>
                    <p className="text-xs font-medium text-slate-500 mt-1">{installation.equipments}</p>
                  </td>
                  <td className="py-4 text-right font-bold text-black">₹{installation.equipmentPrice?.toLocaleString() || 0}</td>
                </tr>
              )}
              {installation.amcPrice > 0 && (
                <tr>
                  <td className="py-4">
                    <p className="font-bold text-black">AMC / Service Contract</p>
                    <p className="text-xs font-medium text-slate-500 mt-1">Includes {installation.servicesCount} scheduled visits</p>
                  </td>
                  <td className="py-4 text-right font-bold text-black">₹{installation.amcPrice?.toLocaleString() || 0}</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="flex justify-end mb-8 sm:mb-12">
            <div className="w-full sm:w-72 flex flex-col gap-3">
              <div className="flex justify-between text-sm text-slate-600 font-medium">
                <span>Subtotal</span>
                <span className="font-bold text-black">₹{(installation.roPrice + installation.equipmentPrice + (installation.amcPrice || 0)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600 font-medium">
                <span>Discount</span>
                <span className="font-bold text-black">-₹{installation.discount?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600 font-medium border-b border-slate-300 pb-3">
                <span>GST (18%)</span>
                <span className="font-bold text-black">₹{((installation.totalPrice) - ((installation.roPrice + installation.equipmentPrice + (installation.amcPrice || 0)) - installation.discount)).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
              <div className="flex justify-between text-lg font-black text-black pt-1">
                <span>Total</span>
                <span>₹{installation.totalPrice?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between text-sm text-black bg-slate-100 border border-slate-200 px-3 py-2 rounded-lg mt-2">
                <span className="font-bold">Amount Paid</span>
                <span className="font-black">₹{installation.amountPaid?.toLocaleString() || 0}</span>
              </div>
              {installation.amountDue > 0 && (
                <div className="flex justify-between text-sm text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2 rounded-lg">
                  <span className="font-bold">Balance Due</span>
                  <span className="font-black">₹{installation.amountDue?.toLocaleString() || 0}</span>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-8 text-center">
            <p className="text-black font-bold">Thank you for choosing Sardar Ji RO!</p>
            <p className="text-slate-500 font-medium text-xs mt-1">For queries, contact your nearest Sardar Ji RO service center.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
