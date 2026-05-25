export const makers = [
    {
        id: 1,
        name: "Sarah K.",
        email: "sarah@locallift.com",
        location: "Kurnool",
        rating: 4.8,
        photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
        products: [1, 2, 3]
    },
    {
        id: 2,
        name: "Rajesh M.",
        email: "rajesh@locallift.com",
        location: "Bengaluru",
        rating: 4.5,
        photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh",
        products: [4, 5]
    },
];

export const products = [
    {
        id: 1,
        makerId: 1,
        name: "Resin Coasters",
        category: "Craft",
        wholesalePrice: 80,
        retailPrice: 150,
        quantity: 45,
        status: "Active",
        description: "Beautiful handmade resin coasters with natural elements",
        image: "https://images.unsplash.com/photo-1584466977770-04aa22f3435d?w=600&auto=format&fit=crop"
    },
    {
        id: 2,
        makerId: 1,
        name: "Handmade Wool Scarf",
        category: "Clothing",
        wholesalePrice: 250,
        retailPrice: 450,
        quantity: 12,
        status: "Active",
        description: "Warm and cozy handwoven wool scarves",
        image: "https://images.unsplash.com/photo-1523540939391-1fd4acf7e569?w=600&auto=format&fit=crop"
    },
    {
        id: 3,
        makerId: 1,
        name: "Art Print Set",
        category: "Art",
        wholesalePrice: 120,
        retailPrice: 250,
        quantity: 8,
        status: "Draft",
        description: "Set of 3 hand-illustrated art prints",
        image: "https://images.unsplash.com/photo-1517430816045-df4b7de11d1b?w=600&auto=format&fit=crop"
    },
    {
        id: 4,
        makerId: 2,
        name: "Organic Honey",
        category: "Food",
        wholesalePrice: 200,
        retailPrice: 350,
        quantity: 30,
        status: "Active",
        description: "Pure organic honey from local apiaries",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop"
    },
    {
        id: 5,
        makerId: 2,
        name: "Handmade Soap",
        category: "Craft",
        wholesalePrice: 60,
        retailPrice: 120,
        quantity: 50,
        status: "Active",
        description: "Natural and organic handmade soaps",
        image: "https://images.unsplash.com/photo-1576671088109-98f20d23c4f5?w=600&auto=format&fit=crop"
    },
];

export const consignments = [
    {
        id: 1,
        shopId: 1,
        productId: 1,
        makerId: 1,
        quantityDropped: 20,
        quantitySold: 14,
        quantityRemaining: 6,
        splitPercentage: 50,
        status: "Active",
        droppedOn: "2026-05-18",
        notes: "Display on main shelf"
    },
    {
        id: 2,
        shopId: 2,
        productId: 2,
        makerId: 1,
        quantityDropped: 8,
        quantitySold: 3,
        quantityRemaining: 5,
        splitPercentage: 50,
        status: "Active",
        droppedOn: "2026-05-15",
        notes: "Keep at checkout counter"
    },
    {
        id: 3,
        shopId: 3,
        productId: 1,
        makerId: 1,
        quantityDropped: 15,
        quantitySold: 15,
        quantityRemaining: 0,
        splitPercentage: 50,
        status: "Settled",
        droppedOn: "2026-05-10",
        notes: ""
    },
    {
        id: 6,
        shopId: 1,
        productId: 2,
        makerId: 1,
        quantityDropped: 6,
        quantitySold: 0,
        quantityRemaining: 6,
        splitPercentage: 50,
        status: "Pending",
        droppedOn: "2026-05-24",
        notes: "Seasonal display request"
    },
    {
        id: 7,
        shopId: 1,
        productId: 3,
        makerId: 1,
        quantityDropped: 10,
        quantitySold: 0,
        quantityRemaining: 10,
        splitPercentage: 50,
        status: "Pending",
        droppedOn: "2026-05-24",
        notes: "Wall display near checkout"
    },
    {
        id: 8,
        shopId: 1,
        productId: 5,
        makerId: 2,
        quantityDropped: 12,
        quantitySold: 0,
        quantityRemaining: 12,
        splitPercentage: 50,
        status: "Pending",
        droppedOn: "2026-05-24",
        notes: "Keep with natural products"
    },
];

export const sales = [
    {
        id: 1,
        consignmentId: 1,
        productName: "Resin Coasters",
        shopName: "Cornerstone Gifts",
        quantitySold: 2,
        date: "2026-05-23",
        makerCut: 160,
        splitPercentage: 50
    },
    {
        id: 2,
        consignmentId: 1,
        productName: "Resin Coasters",
        shopName: "Cornerstone Gifts",
        quantitySold: 3,
        date: "2026-05-22",
        makerCut: 240,
        splitPercentage: 50
    },
    {
        id: 3,
        consignmentId: 2,
        productName: "Handmade Wool Scarf",
        shopName: "Urban Boutique",
        quantitySold: 1,
        date: "2026-05-20",
        makerCut: 225,
        splitPercentage: 50
    },
    {
        id: 4,
        consignmentId: 1,
        productName: "Resin Coasters",
        shopName: "Cornerstone Gifts",
        quantitySold: 9,
        date: "2026-05-19",
        makerCut: 720,
        splitPercentage: 50
    },
];

export const shops = [
    {
        id: 1,
        name: "Cornerstone Gifts",
        type: "Gift Store",
        location: "Kurnool",
        distance: 0.5,
        shelfSlots: 3,
        image: "https://api.dicebear.com/7.x/identicon/svg?seed=cornerstone"
    },
    {
        id: 2,
        name: "Urban Boutique",
        type: "Fashion & Lifestyle",
        location: "Kurnool",
        distance: 1.2,
        shelfSlots: 2,
        image: "https://api.dicebear.com/7.x/identicon/svg?seed=urban"
    },
    {
        id: 3,
        name: "Artisan Market",
        type: "Handmade Store",
        location: "Kurnool",
        distance: 2.1,
        shelfSlots: 5,
        image: "https://api.dicebear.com/7.x/identicon/svg?seed=artisan"
    },
    {
        id: 4,
        name: "The Spice House",
        type: "Food & Groceries",
        location: "Kurnool",
        distance: 0.8,
        shelfSlots: 4,
        image: "https://api.dicebear.com/7.x/identicon/svg?seed=spice"
    },
    {
        id: 5,
        name: "Local Crafts Co.",
        type: "Handmade Store",
        location: "Kurnool",
        distance: 1.5,
        shelfSlots: 6,
        image: "https://api.dicebear.com/7.x/identicon/svg?seed=crafts"
    },
    {
        id: 6,
        name: "Wellness Hub",
        type: "Natural Products",
        location: "Kurnool",
        distance: 3.2,
        shelfSlots: 2,
        image: "https://api.dicebear.com/7.x/identicon/svg?seed=wellness"
    },
];

export const freelancers = [
    {
        id: 1,
        name: "Priya M.",
        skills: ["Product Photography", "Social Media"],
        ratePerGig: 500,
        portfolio: "https://priaphotography.com",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya"
    },
    {
        id: 2,
        name: "Arjun S.",
        skills: ["Graphic Design", "Branding"],
        ratePerGig: 800,
        portfolio: "https://arjundesign.com",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun"
    },
    {
        id: 3,
        name: "Ananya K.",
        skills: ["Content Writing", "SEO"],
        ratePerGig: 400,
        portfolio: "https://ananyawriting.com",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya"
    },
    {
        id: 4,
        name: "Vikram P.",
        skills: ["Video Editing", "Marketing"],
        ratePerGig: 1000,
        portfolio: "https://vikramvideos.com",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram"
    },
    {
        id: 5,
        name: "Deepa R.",
        skills: ["Packaging Design", "Illustration"],
        ratePerGig: 600,
        portfolio: "https://deepadesign.com",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Deepa"
    },
];

export const freelancerGigs = [
    {
        id: "g1",
        businessName: "Cornerstone Gifts",
        jobType: "Instagram Reels",
        budget: 1500,
        location: "Kurnool",
        postedDate: "2026-05-20"
    },
    {
        id: "g2",
        businessName: "The Little Store",
        jobType: "Product Photography",
        budget: 2000,
        location: "Kurnool",
        postedDate: "2026-05-21"
    },
    {
        id: "g3",
        businessName: "Sarah K.",
        jobType: "Social Media Management",
        budget: 3000,
        location: "Kurnool",
        postedDate: "2026-05-22"
    }
];

export const portfolioItems = [
    {
        id: "p1",
        title: "Resin Coaster Campaign",
        brand: "Cornerstone Gifts",
        location: "Kurnool",
        thumbnail: "https://picsum.photos/seed/reel1/400/300",
        description: "30-second Instagram Reel, geo-targeted Kurnool"
    },
    {
        id: "p2",
        title: "Candle Launch Video",
        brand: "The Little Store",
        location: "Kurnool",
        thumbnail: "https://picsum.photos/seed/reel2/400/300",
        description: "Product launch reel, 2k views"
    },
    {
        id: "p3",
        title: "Embroidery Hoop Showcase",
        brand: "Local Boutique",
        location: "Kurnool",
        thumbnail: "https://picsum.photos/seed/reel3/400/300",
        description: "Photography + reel combo"
    }
];

export const settlementData = [
    {
        id: "s1",
        productName: "Resin Coasters",
        makerName: "Sarah K.",
        shopName: "Cornerstone Gifts",
        unitsSold: 14,
        retailPrice: 150,
        makerCut: 1050,
        shopProfit: 1050
    },
    {
        id: "s2",
        productName: "Handmade Candles",
        makerName: "Priya M.",
        shopName: "The Little Store",
        unitsSold: 8,
        retailPrice: 200,
        makerCut: 800,
        shopProfit: 800
    }
];
