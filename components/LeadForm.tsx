import React, { useState } from 'react';
import { LeadSubmission } from '../types';
import { evaluateLeadSubmission } from '../services/geminiService';

interface LeadFormProps {
  onPass: () => void;
  isTrainingMode?: boolean; // If true, shows feedback. If false (SOP), just submits.
}

const LeadForm: React.FC<LeadFormProps> = ({ onPass, isTrainingMode = true }) => {
  const [formData, setFormData] = useState<LeadSubmission>({
    affiliateName: '',
    clientName: '',
    businessTime: '',
    revenue: '',
    creditScore: '',
    industry: '',
    purpose: '',
    urgency: 'Medium',
    hasBankStatements: false,
    icpMet: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate API delay
    await new Promise(r => setTimeout(r, 1500));
    
    const evalResult = await evaluateLeadSubmission(formData);
    setResult(evalResult);
    setSubmitting(false);

    if (evalResult.status === 'Accepted') {
      onPass();
    }
  };

  if (result) {
    return (
      <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-slate-200 text-center">
        <div className={`inline-flex items-center justify-center h-16 w-16 rounded-full mb-6 ${result.status === 'Accepted' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          {result.status === 'Accepted' ? (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          ) : (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          )}
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Lead {result.status}</h3>
        <p className="text-lg text-slate-600 mb-4">{result.reason}</p>
        <div className="bg-slate-50 p-4 rounded-lg text-left text-sm text-slate-700 mb-6 border border-slate-100">
            <span className="font-semibold block mb-1">AI Coach Notes:</span>
            {result.notes}
        </div>
        <button 
            onClick={() => { setResult(null); setFormData(prev => ({...prev, clientName: '', revenue: '', creditScore: ''})); }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
        >
            Submit Another Lead
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-800">New Lead Submission</h3>
        <p className="text-slate-500 text-sm">Fill out the details to test against new ICP criteria ($20k+ Rev, 2yr+ TIB, 680+ Credit).</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Client Name</label>
                <input required name="clientName" value={formData.clientName} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Business Name" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Affiliate Name</label>
                <input required name="affiliateName" value={formData.affiliateName} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Your Name" />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Revenue</label>
                <input required name="revenue" value={formData.revenue} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="$25,000" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Time in Business</label>
                <select required name="businessTime" value={formData.businessTime} onChange={handleChange} className="w-full px-3 py-2 border rounded-md bg-white">
                    <option value="">Select...</option>
                    <option value="<1y">Less than 1 year</option>
                    <option value="1y">1 Year</option>
                    <option value="2y+">2 Years+</option>
                    <option value="5y+">5 Years+</option>
                    <option value="10y+">10 Years+</option>
                </select>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Est. Credit Score</label>
                <input required name="creditScore" value={formData.creditScore} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="e.g. 720" />
            </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
                <input required name="industry" value={formData.industry} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="e.g. Construction" />
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Purpose of Funds</label>
            <textarea required name="purpose" value={formData.purpose} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none" rows={2} placeholder="Brief description..." />
        </div>

        <div className="space-y-2 pt-2">
            <div className="flex items-center space-x-2">
                <input type="checkbox" name="hasBankStatements" id="hasBankStatements" checked={formData.hasBankStatements} onChange={(e) => setFormData({...formData, hasBankStatements: e.target.checked})} className="h-4 w-4 text-blue-600 rounded" />
                <label htmlFor="hasBankStatements" className="text-sm text-slate-700">Client has access to 3-6 months business bank statements</label>
            </div>
            <div className="flex items-center space-x-2">
                <input type="checkbox" name="icpMet" id="icpMet" checked={formData.icpMet} onChange={(e) => setFormData({...formData, icpMet: e.target.checked})} className="h-4 w-4 text-blue-600 rounded" />
                <label htmlFor="icpMet" className="text-sm text-slate-700">I certify this lead meets basic ICP (No guarantees made)</label>
            </div>
        </div>

        <button 
            type="submit" 
            disabled={submitting || !formData.icpMet}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
        >
            {submitting ? 'Analyzing...' : 'Submit Lead'}
        </button>
      </form>
    </div>
  );
};

export default LeadForm;