import ProductModel from "../models/Product.js"
import ProductStatModel from "../models/ProductStat.js"
import TransactionModel from "../models/Transaction.js";
import UserModel from "../models/User.js";


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

export const getCustomers = async (req, res) => {
    try {
        const usersList = await UserModel
                            .find({role: "user"})
                            .select("-password")  //get all apart from password field
        return res.status(200).json(usersList)
    }
    catch(error) {
        console.log("error", error)
        return res.status(400).json({message: error.message})
    }
}

//Transaction have implemented pagination
//http://localhost:5001/client/transactions?page=1&limit=10&sort={"field": "userId", "sort": "desc"}&search=2001.58
export const getTransactions = async (req, res) => {
    try {
        const query = req.query

        //sort should look like this {"field": "field_need_be_sorted, "sort": "desc"}
        const {page = 1, pageSize = 20, sort = null, search = "" } = query

        const generateSort = () => {
            const sortParsed = JSON.parse(sort)
            const sortFormatted = {
                [sortParsed.field]: sortParsed.sort === "asc" ? 1 : -1
            }
            return sortFormatted
        }

        const sortFormatted = sort ? generateSort(sort) : {}
        const searchCondition = search
        ? {
              $or: [ // or là tìm kiếm ở một trong các cột
                //   { field1: { $regex: search, $options: "i" } }, // Tìm kiếm theo field1, nếu có các field khác ta dùng thêm new object
                    {cost: {$regex: search, $options: "i"}}, //tìm kiếm theo field cost
                    {userId: {$regex: search, $options: "i"}},
               
              ],
          }
        : {};

    const transactions = await TransactionModel.find(searchCondition)
        .sort(sortFormatted)
        .skip((page - 1) * pageSize)
        .limit(Number(pageSize));

    const total = await TransactionModel.countDocuments(searchCondition); //total items of documents that correspond with search Conditions
    console.log("query::::", query)
    return res.status(200).json({ transactions, total, page, pageSize });
   
    } catch (error) {
        return res.status(400).json({message: error.message})
    }
}
