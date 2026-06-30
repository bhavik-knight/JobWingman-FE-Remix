import React from 'react';
import { useNavigate } from '@remix-run/react';
import { ArrowRight } from 'lucide-react';
import { useApplications } from '../hooks/useApplications';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const jobDetailsSchema = Yup.object({
  title: Yup.string().required('Job title is required'),
  company: Yup.string().required('Company name is required'),
  rawText: Yup.string().required('Job description content is required'),
  url: Yup.string().url('Invalid URL format').nullable(),
  postingDate: Yup.date().nullable().typeError('Invalid date format'),
  deadline: Yup.date()
    .nullable()
    .typeError('Invalid date format')
    .min(Yup.ref('postingDate'), 'Deadline cannot be earlier than the posting date'),
  referralName: Yup.string().nullable(),
  referralEmail: Yup.string().email('Invalid email format').nullable()
});

export default function JobDetails() {
  const navigate = useNavigate();
  const { wizardForm, handleSaveJobDetails } = useApplications();

  const handleNextSubmit = (values: any) => {
    handleSaveJobDetails({
      ...values,
      jobTitle: values.title,
      jobDescription: values.rawText,
      jobPostingDate: values.postingDate,
      jobLink: values.url
    });
    navigate('/wizard/upload-resume');
  };

  const formik = useFormik({
    initialValues: {
      title: (wizardForm as any)?.title || wizardForm?.jobTitle || '',
      company: (wizardForm as any)?.company || wizardForm?.company || '',
      rawText: (wizardForm as any)?.rawText || wizardForm?.jobDescription || '',
      url: (wizardForm as any)?.url || wizardForm?.jobLink || '',
      postingDate: (wizardForm as any)?.postingDate || wizardForm?.jobPostingDate || '',
      deadline: (wizardForm as any)?.deadline || wizardForm?.deadline || '',
      referralName: (wizardForm as any)?.referralName || wizardForm?.referralName || '',
      referralEmail: (wizardForm as any)?.referralEmail || wizardForm?.referralEmail || ''
    },
    validationSchema: jobDetailsSchema,
    onSubmit: (values) => {
      handleNextSubmit(values);
    }
  });

  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
      <div>
        <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
          <span>📋</span> Step 1: Target Job Specification
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">Enter the requirements for the job you want to target.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4 items-stretch">
        {/* LEFT COLUMN: Metadata inputs (Spans 5 out of 12 columns) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1">Job Title *</label>
            <input 
              type="text" 
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary" 
              {...formik.getFieldProps('title')} 
            />
            {formik.touched.title && formik.errors.title && (
              <span className="text-[10px] text-red-500 mt-0.5 block">{formik.errors.title}</span>
            )}
          </div>
          
          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1">Company *</label>
            <input 
              type="text" 
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary" 
              {...formik.getFieldProps('company')} 
            />
            {formik.touched.company && formik.errors.company && (
              <span className="text-[10px] text-red-500 mt-0.5 block">{formik.errors.company}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">Posting Date</label>
              <input 
                type="date" 
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary cursor-pointer" 
                {...formik.getFieldProps('postingDate')} 
                onClick={(e) => {
                  try {
                    e.currentTarget.showPicker();
                  } catch (err) {}
                }}
              />
              {formik.touched.postingDate && formik.errors.postingDate && (
                <span className="text-[10px] text-red-500 mt-0.5 block">{formik.errors.postingDate as string}</span>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">Application Deadline</label>
              <input 
                type="date" 
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary cursor-pointer" 
                {...formik.getFieldProps('deadline')} 
                onClick={(e) => {
                  try {
                    e.currentTarget.showPicker();
                  } catch (err) {}
                }}
              />
              {formik.touched.deadline && formik.errors.deadline && (
                <span className="text-[10px] text-red-500 mt-0.5 block">{formik.errors.deadline as string}</span>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1">Job Link</label>
            <input 
              type="text" 
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary" 
              {...formik.getFieldProps('url')} 
            />
            {formik.touched.url && formik.errors.url && (
              <span className="text-[10px] text-red-500 mt-0.5 block">{formik.errors.url}</span>
            )}
          </div>

          {/* Nested Referral Contact Box */}
          <div className="border border-zinc-800 bg-zinc-900/50 p-3 rounded-lg space-y-2 mt-1">
            <h4 className="text-xs font-semibold text-zinc-400">Referral Contact (Optional)</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-zinc-400 block mb-0.5">Referral Name</label>
                <input 
                  type="text" 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-primary" 
                  {...formik.getFieldProps('referralName')} 
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-400 block mb-0.5">Referral Email</label>
                <input 
                  type="email" 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-primary" 
                  {...formik.getFieldProps('referralEmail')} 
                />
                {formik.touched.referralEmail && formik.errors.referralEmail && (
                  <span className="text-[10px] text-red-500 mt-0.5 block">{formik.errors.referralEmail}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Big Job Description Box (Spans 7 out of 12 columns) */}
        <div className="lg:col-span-7 flex flex-col">
          <label className="text-xs font-medium text-zinc-300 block mb-1">Job Description *</label>
          <textarea 
            className="w-full flex-grow min-h-[500px] p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white font-mono leading-relaxed resize-none focus:outline-none focus:border-primary"
            placeholder="Paste the core requirements, skill lists, and roles..."
            {...formik.getFieldProps('rawText')}
          />
          {formik.touched.rawText && formik.errors.rawText && (
            <span className="text-[10px] text-red-500 mt-0.5 block">{formik.errors.rawText}</span>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-border">
        <button 
          type="button" 
          onClick={() => formik.handleSubmit()}
          className="bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-primary-glow"
        >
          <span>Next Step</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
