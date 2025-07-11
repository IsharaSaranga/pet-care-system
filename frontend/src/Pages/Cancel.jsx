import { Link } from "react-router-dom";

const Cancel = () => {
  return (
    <div className="max-w-6xl mx-auto p-8 pt-24 text-center">
      <h1 className="text-3xl font-bold text-[#D08860]">Payment Cancelled</h1>
      <p className="mt-4 text-lg">Your payment was cancelled. You can try booking again.</p>
      <Link
        to="/"
        className="mt-6 inline-block px-6 py-3 bg-[#D08860] text-white rounded-lg hover:bg-[#B3714E] transition"
      >
        Back to Home
      </Link>
    </div>
  );
};

export default Cancel;