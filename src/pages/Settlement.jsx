import { useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { where } from "firebase/firestore";
import { getDashboardPath, useAuth } from "../auth/AuthContext";
import Navbar from "../components/Navbar";
import { useCollection, emptyConstraints } from "../firebase/firestoreHooks";

const formatDate = (date) => date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const Settlement = () => {
    const { currentUser, userDoc } = useAuth();
    const navigate = useNavigate();
    const uid = currentUser?.uid;
    const role = userDoc?.role;
    const dashboardPath = getDashboardPath(role);

    const salesQuery = useMemo(() => {
        if (!uid) return emptyConstraints;
        if (role === "maker") return [where("makerId", "==", uid)];
        if (role === "shopkeeper") return [where("shopId", "==", uid)];
        return emptyConstraints;
    }, [uid, role]);

    const gigsQuery = useMemo(() => {
        if (!uid) return emptyConstraints;
        if (role === "freelancer") return [where("freelancerId", "==", uid)];
        return emptyConstraints;
    }, [uid, role]);

    const { items: sales, loading: salesLoading, error: salesError } = useCollection("sales", salesQuery, Boolean(uid));
    const { items: gigs, loading: gigsLoading, error: gigsError } = useCollection("gigs", gigsQuery, Boolean(uid));

    useEffect(() => {
        document.title = "Settlement Report — Local Lift";
    }, []);

    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const rows = useMemo(() => sales.map(sale => {
        const unitsSold = Number(sale.unitsSold ?? sale.quantitySold ?? 0);
        const makerCut = Number(sale.makerCut || 0);
        const totalRevenue = Number(sale.totalRevenue || unitsSold * Number(sale.retailPrice || 0) || makerCut * 2);
        const shopProfit = Number(sale.shopProfit || totalRevenue - makerCut);
        const retailPrice = Number(sale.retailPrice || (unitsSold ? totalRevenue / unitsSold : 0));

        return {
            id: sale.id,
            productName: sale.productName || "Unknown Product",
            makerName: sale.makerName || "Unknown Maker",
            shopName: sale.shopName || "Unknown Shop",
            unitsSold,
            retailPrice,
            totalRevenue,
            makerCut,
            shopProfit,
            paid: Boolean(sale.paid)
        };
    }), [sales]);

    const totalRevenue = rows.reduce((sum, row) => sum + row.totalRevenue, 0);
    const totalMakerPayouts = rows.reduce((sum, row) => sum + row.makerCut, 0);
    const totalFreelancerFees = gigs.reduce((sum, gig) => sum + Number(gig.budget || gig.fee || 0), 0);
    const netPlatformActivity = totalRevenue + totalFreelancerFees;

    const makerSummary = useMemo(() => {
        const map = new Map();
        rows.forEach(row => {
            const existing = map.get(row.makerName) || { makerName: row.makerName, unitsSold: 0, totalOwed: 0, paid: true };
            existing.unitsSold += row.unitsSold;
            existing.totalOwed += row.makerCut;
            existing.paid = existing.paid && row.paid;
            map.set(row.makerName, existing);
        });
        return [...map.values()];
    }, [rows]);

    const loading = salesLoading || gigsLoading;
    const error = salesError || gigsError;

    return (
        <div className="min-h-screen bg-[#F5F5F0] p-4 sm:p-8 print:bg-white print:p-0">
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; color: black !important; }
                    .report-card { box-shadow: none !important; border-color: #000 !important; }
                    table { page-break-inside: auto; }
                    tr { page-break-inside: avoid; page-break-after: auto; }
                }
            `}</style>

            <Navbar />

            <main className="max-w-6xl mx-auto bg-white rounded-[12px] border border-gray-200 p-6 sm:p-8 shadow-sm print:shadow-none print:border-0">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6 no-print">
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                        >
                            Back
                        </button>
                        <Link
                            to={dashboardPath}
                            className="rounded-full border border-[#2D6A4F] px-4 py-2 text-sm font-medium text-[#2D6A4F] hover:bg-[#E8F5EC] transition"
                        >
                            Go to Dashboard
                        </Link>
                    </div>
                    <button onClick={() => window.print()} className="no-print px-4 py-2 bg-[#2D6A4F] text-white rounded-lg hover:bg-[#24563f] transition font-medium">
                        Print
                    </button>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-gray-200 pb-6 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-[#2D6A4F] print:text-black">Local Lift</h1>
                        <p className="text-xl font-semibold text-gray-900 mt-2">Weekly Settlement Report</p>
                        <p className="text-sm text-gray-600">{formatDate(weekStart)} - {formatDate(weekEnd)}</p>
                        <p className="text-sm text-gray-600">Generated on: {formatDate(today)}</p>
                    </div>
                    <button onClick={() => window.print()} className="no-print px-4 py-2 bg-[#2D6A4F] text-white rounded-lg hover:bg-[#24563f] transition font-medium">
                        Print
                    </button>
                </div>

                {loading && <div className="report-card rounded-lg border p-4 mb-6">Loading settlement data...</div>}
                {error && <div className="no-print rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-800 mb-6">{error}</div>}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {[
                        ["Total Revenue This Week", totalRevenue],
                        ["Total Maker Payouts", totalMakerPayouts],
                        ["Total Freelancer Fees", totalFreelancerFees],
                        ["Net Platform Activity", netPlatformActivity]
                    ].map(([label, value]) => (
                        <div key={label} className="report-card rounded-[12px] border border-gray-200 p-4">
                            <p className="text-sm text-gray-600">{label}</p>
                            <p className="text-2xl font-bold text-gray-900">₹{value.toLocaleString()}</p>
                        </div>
                    ))}
                </div>

                <section className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-3">Consignment Breakdown</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border border-gray-200">
                            <thead className="bg-gray-50 print:bg-white">
                                <tr>
                                    {["Product", "Maker", "Shop", "Units Sold", "Retail Price", "Total Revenue", "Maker Cut", "Shop Profit"].map(header => (
                                        <th key={header} className="border border-gray-200 px-3 py-2 text-left">{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map(row => (
                                    <tr key={row.id}>
                                        <td className="border border-gray-200 px-3 py-2">{row.productName}</td>
                                        <td className="border border-gray-200 px-3 py-2">{row.makerName}</td>
                                        <td className="border border-gray-200 px-3 py-2">{row.shopName}</td>
                                        <td className="border border-gray-200 px-3 py-2">{row.unitsSold}</td>
                                        <td className="border border-gray-200 px-3 py-2">₹{row.retailPrice}</td>
                                        <td className="border border-gray-200 px-3 py-2">₹{row.totalRevenue}</td>
                                        <td className="border border-gray-200 px-3 py-2">₹{row.makerCut}</td>
                                        <td className="border border-gray-200 px-3 py-2">₹{row.shopProfit}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-3">Freelancer Payments</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border border-gray-200">
                            <thead className="bg-gray-50 print:bg-white">
                                <tr>
                                    {["Freelancer", "Job Type", "Brand", "Fee", "Status"].map(header => (
                                        <th key={header} className="border border-gray-200 px-3 py-2 text-left">{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {gigs.map((gig) => {
                                    return (
                                        <tr key={gig.id}>
                                            <td className="border border-gray-200 px-3 py-2">{gig.freelancerName || "Unassigned"}</td>
                                            <td className="border border-gray-200 px-3 py-2">{gig.jobType}</td>
                                            <td className="border border-gray-200 px-3 py-2">{gig.businessName}</td>
                                            <td className="border border-gray-200 px-3 py-2">₹{gig.budget}</td>
                                            <td className="border border-gray-200 px-3 py-2">Pending</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">Per-Maker Summary</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {makerSummary.map(summary => (
                            <div key={summary.makerName} className="report-card rounded-[12px] border border-gray-200 p-4">
                                <h3 className="font-bold text-gray-900">{summary.makerName}</h3>
                                <p className="text-sm text-gray-600 mt-2">Units sold: {summary.unitsSold}</p>
                                <p className="text-sm text-gray-600">Total owed: ₹{summary.totalOwed}</p>
                                <p className="text-sm font-semibold mt-2">{summary.paid ? "Paid" : "Pending"}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Settlement;
