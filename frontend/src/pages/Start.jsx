import React from 'react';
import { Link } from 'react-router-dom';

const Start = () => {
  return (
    <div className="h-screen w-full bg-cover bg-center bg-no-repeat bg-[url('https://images.unsplash.com/photo-1619059558110-c45be64b73ae?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] flex flex-col justify-between p-6 md:p-12">

      {/* Logo */}
      <img 
        className="w-16 md:w-20" 
        src="https://cdn-assets-eu.frontify.com/s3/frontify-enterprise-files-eu/eyJwYXRoIjoid2VhcmVcL2ZpbGVcLzhGbTh4cU5SZGZUVjUxYVh3bnEyLnN2ZyJ9:weare:F1cOF9Bps96cMy7r9Y2d7affBYsDeiDoIHfqZrbcxAw?width=1200&height=417" 
        alt="Uber logo" 
      />

      {/* White Box Content */}
      <div className="bg-white bg-opacity-90 rounded-xl p-6 md:p-8 w-full max-w-md mx-auto shadow-md mb-8">
        <h2 className="text-[28px] md:text-[32px] font-semibold text-gray-800 text-center">
          Get Started with Uber
        </h2>

        <Link 
          to="/login" 
          className="block text-center bg-black text-white py-3 rounded-lg mt-6 text-base md:text-lg hover:bg-gray-900 transition"
        >
          Continue
        </Link>
      </div>
    </div>
  );
};

export default Start;
