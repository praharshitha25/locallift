import { Link } from "react-router-dom";

const Login = () => {
    return (
        <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-6">

            <div className="bg-white border shadow-sm rounded-3xl p-10 w-full max-w-md">

                <h1 className="text-4xl font-bold text-center text-[#2D6A4F] mb-3">
                    LocalLift
                </h1>

                <p className="text-gray-500 text-center mb-8">
                    Choose your role to continue
                </p>

                <div className="space-y-4">

                    <Link
                        to="/maker"
                        className="block w-full text-center bg-[#2D6A4F] hover:bg-[#24563f] text-white py-3 rounded-2xl transition"
                    >
                        Continue as Maker
                    </Link>

                    <Link
                        to="/shopkeeper"
                        className="block w-full text-center border py-3 rounded-2xl hover:bg-gray-50 transition"
                    >
                        Continue as Shopkeeper
                    </Link>

                    <Link
                        to="/freelancer"
                        className="block w-full text-center border py-3 rounded-2xl hover:bg-gray-50 transition"
                    >
                        Continue as Freelancer
                    </Link>

                </div>
            </div>
        </div>
    );
};

export default Login;
