'use client';

import { useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';

export default function TestUploadPage() {
    const [status, setStatus] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const addStatus = (msg: string) => {
        setStatus(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    const runDiagnostics = async () => {
        setIsLoading(true);
        setStatus([]);

        const supabase = getSupabaseClient();

        // Test 1: Check connection
        addStatus('Testing Supabase connection...');
        try {
            const { data, error } = await supabase.from('vendors').select('id').limit(1);
            if (error) {
                addStatus(`❌ Database connection FAILED: ${error.message}`);
            } else {
                addStatus(`✅ Database connection OK`);
            }
        } catch (e: any) {
            addStatus(`❌ Database connection ERROR: ${e.message}`);
        }

        // Test 2: Check auth
        addStatus('Checking authentication...');
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error || !user) {
                addStatus(`⚠️ Not authenticated - uploads will fail due to RLS`);
            } else {
                addStatus(`✅ Authenticated as: ${user.email}`);
            }
        } catch (e: any) {
            addStatus(`❌ Auth check ERROR: ${e.message}`);
        }

        // Test 3: List storage buckets
        addStatus('Listing storage buckets...');
        try {
            const { data: buckets, error } = await supabase.storage.listBuckets();
            if (error) {
                addStatus(`❌ Cannot list buckets: ${error.message}`);
            } else if (!buckets || buckets.length === 0) {
                addStatus(`⚠️ No storage buckets found! You need to create: portfolio, shorts, services, vendors, onboarding`);
            } else {
                addStatus(`✅ Found ${buckets.length} bucket(s): ${buckets.map(b => b.name).join(', ')}`);

                // Check required buckets
                const required = ['portfolio', 'shorts', 'services', 'vendors', 'onboarding'];
                const existing = buckets.map(b => b.name);
                const missing = required.filter(r => !existing.includes(r));
                if (missing.length > 0) {
                    addStatus(`⚠️ MISSING BUCKETS: ${missing.join(', ')}`);
                } else {
                    addStatus(`✅ All required buckets exist`);
                }
            }
        } catch (e: any) {
            addStatus(`❌ Bucket list ERROR: ${e.message}`);
        }

        // Test 4: Try a test upload to portfolio bucket
        addStatus('Testing upload to "portfolio" bucket...');
        try {
            const testBlob = new Blob(['test'], { type: 'text/plain' });
            const testFile = new File([testBlob], 'test.txt', { type: 'text/plain' });
            const testPath = `diagnostic-test-${Date.now()}.txt`;

            const { data, error } = await supabase.storage
                .from('portfolio')
                .upload(testPath, testFile, { upsert: true });

            if (error) {
                if (error.message.includes('bucket') || error.message.includes('not found')) {
                    addStatus(`❌ BUCKET NOT FOUND: Create a PUBLIC bucket named "portfolio" in Supabase Dashboard`);
                } else if (error.message.includes('security') || error.message.includes('policy')) {
                    addStatus(`❌ RLS POLICY BLOCKED: Add an INSERT policy for authenticated users on "portfolio" bucket`);
                } else {
                    addStatus(`❌ Upload failed: ${error.message}`);
                }
            } else {
                addStatus(`✅ Test upload successful! Path: ${data.path}`);

                // Clean up test file
                await supabase.storage.from('portfolio').remove([testPath]);
                addStatus(`✅ Test file cleaned up`);
            }
        } catch (e: any) {
            addStatus(`❌ Upload test ERROR: ${e.message}`);
        }

        addStatus('--- DIAGNOSTICS COMPLETE ---');
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-900 p-8 font-mono text-sm">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold text-white mb-6">Supabase Storage Diagnostics</h1>

                <button
                    onClick={runDiagnostics}
                    disabled={isLoading}
                    className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold mb-6 hover:bg-primary-700 disabled:opacity-50"
                >
                    {isLoading ? 'Running...' : 'Run Diagnostics'}
                </button>

                <div className="bg-black rounded-xl p-6 border border-gray-700">
                    {status.length === 0 ? (
                        <p className="text-gray-500">Click button to run diagnostics...</p>
                    ) : (
                        status.map((s, i) => (
                            <p key={i} className={`mb-1 ${s.includes('❌') ? 'text-red-400' : s.includes('⚠️') ? 'text-yellow-400' : s.includes('✅') ? 'text-green-400' : 'text-gray-300'}`}>
                                {s}
                            </p>
                        ))
                    )}
                </div>

                <div className="mt-8 p-6 bg-gray-800 rounded-xl border border-gray-700">
                    <h2 className="text-lg font-bold text-white mb-4">Quick Fixes</h2>
                    <ul className="text-gray-300 space-y-3">
                        <li>1. Go to <strong className="text-primary-400">Supabase Dashboard → Storage</strong></li>
                        <li>2. Create these PUBLIC buckets: <code className="bg-gray-700 px-2 py-0.5 rounded">portfolio</code>, <code className="bg-gray-700 px-2 py-0.5 rounded">shorts</code>, <code className="bg-gray-700 px-2 py-0.5 rounded">services</code>, <code className="bg-gray-700 px-2 py-0.5 rounded">vendors</code>, <code className="bg-gray-700 px-2 py-0.5 rounded">onboarding</code></li>
                        <li>3. For each bucket, go to <strong className="text-primary-400">Policies</strong> and add:
                            <ul className="ml-4 mt-2 text-sm text-gray-400">
                                <li>• <strong>INSERT</strong> policy: Allow authenticated users</li>
                                <li>• <strong>SELECT</strong> policy: Allow public access (for viewing)</li>
                            </ul>
                        </li>
                        <li>4. Ensure you are <strong className="text-yellow-400">logged in</strong> to the vendor dashboard before uploading</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
