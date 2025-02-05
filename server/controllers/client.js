import ProductModel from "../models/Product.js"
import ProductStatModel from "../models/ProductStat.js"


export const getProducts = async (req, res) => {
    try {

        // Nếu làm như này sẽ bị N+1 query vì với mỗi product ta sẽ phải thêm 1 query find nữa (trong map)   : 845ms
        /*
        const dataProducts = await ProductModel.find()

        const productsWithStats = await Promise.all(
            dataProducts.map(async (product) => { 
                const stat = await ProductStatModel.find({  //find productid that its id exist on productStatModel
                    productId: product._id
                })
                .select('productId yearlySalesTotal yearlyTotalSoldUnits year');  //we will `select` to specific the fields that we want to get
                return {...product.toObject(), stat: stat}
            })
        )
       */

        /*   Cách 2:   Ta có thể tối ưu hơn với việc sử dụng method $in trong Mongo    :137ms
  
        const dataProducts = await ProductModel.find()
        const productIds = dataProducts.map(product => product._id)

        // Thực hiện một truy vấn duy nhất để lấy thông tin stat cho tất cả các productId
        const productStats = await ProductStatModel.find({
            productId: { $in: productIds } // Lọc theo tất cả productId
        })
            .select('productId yearlySalesTotal yearlyTotalSoldUnits year');

        // Gắn stat cho từng sản phẩm
        const productsWithStats = dataProducts.map(product => {
            // Tìm stats của sản phẩm hiện tại trong productStats
            const stat = productStats.filter(stat => stat.productId.toString() === product._id.toString());
            return { ...product.toObject(), stat };
        });

        */

        //Cách 3 - dùng $lookup trong aggregate trong mongo tương đương với join trong mysql
        const productsWithStats = await ProductModel.aggregate([
            {
                $lookup: {
                    from: "productstats",  // Tên của collection ProductStatModel trong MongoDB
                    localField: "_id.str",      // Trường _id trong ProductModel (kiểu ObjectId) --.str là chuyển string
                    foreignField: "productId.str", // Trường productId trong ProductStatModel (kiểu String, sẽ ép kiểu)
                    as: "stat"             // Tên của trường chứa kết quả từ ProductStatModel
                }
            },
            {
                $project: {
                    // Lấy tất cả các trường của ProductModel
                    name: 1,
                    price: 1,
                    description: 1,
                    category: 1,
                    rating: 1,
                    supply: 1,
                    // Trường stat từ ProductStatModel
                    stat: {
                        yearlySalesTotal: 1,
                        yearlyTotalSoldUnits: 1
                    }
                }
            }
        ]);

        const productStats = await ProductStatModel.find({ productId: "63701d24f03239c72c00018e" });
        console.log(productStats[0]);  // Kiểm tra dữ liệu trong ProductStatModel
        
        return res.status(200).json(productsWithStats)
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}