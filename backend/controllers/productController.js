import Product from '../models/Product.js'
import Category from '../models/Category.js'
import Brand from '../models/Brand.js'
import Tag from '../models/Tag.js'

import fs from 'fs'
import csvParser from 'csv-parser'
import slugify from 'slugify'
import mongoose from 'mongoose'

// GET Products
// GET Products
export const getProducts = async (req, res) => {
  try {
    const { id } = req.params
    const { page = 1, limit = 20, search = '' } = req.query

    // ✅ Search only on productName & productSku
    const query = search
      ? {
          $or: [
            { productName: { $regex: search, $options: 'i' } },
            { productSku: { $regex: search, $options: 'i' } },
          ],
        }
      : {}

    if (id) {
      const product = await Product.findById(id).sort({ createdAt: -1 })
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' })
      }
      return res.status(200).json({ success: true, product })
    }

    const total = await Product.countDocuments(query)

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .allowDiskUse(true)

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      products,
    })
  } catch (err) {
    console.error('Get products error: - productController.js:33', err)
    return res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
}

// POST
export const createProduct = async (req, res) => {
  try {
    // ---------------- Extract fields from req.body ----------------
    const {
      productName,
      productSlug,
      productShortDescription,
      productLongDescription,
      categories: categoryNames = [],
      brands: brandNames = [],
      tags: tagIds = [], // Frontend sends tag IDs
      productSku,
      productRegularPriceInr = 0,
      productSalePriceInr = 0,
      productRegularPriceUsd = 0,
      productSalePriceUsd = 0,
      productStock, // Matches frontend
      productWeight,
      productLength,
      productWidth,
      productHeight,
      attributes: attributesJSON,
    } = req.body

    // ---------------- Slug handling ----------------
    let baseSlug = productSlug
      ?.trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
    if (!baseSlug && productName) {
      baseSlug = productName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
    }

    let uniqueSlug = baseSlug
    let counter = 1

    // Loop until we find a truly unique slug
    while (await Product.findOne({ productSlug: uniqueSlug })) {
      uniqueSlug = `${baseSlug}-${counter}`
      counter++
    }

    // ---------------- Dimensions ----------------
    const productDimensions = {
      length: productLength || 0,
      width: productWidth || 0,
      height: productHeight || 0,
    }

    // ---------------- Parse attributes ----------------
    let attributes = []
    if (attributesJSON) {
      const attrs = JSON.parse(attributesJSON)

      attributes = attrs.map((attr) => ({
        attributeName: attr.attributeName,
        attributeValues: attr.attributeValues.map((val) => {
          let imagePath = ''
          if (req.files && req.files['attrImages']) {
            // match uploaded attribute image by original file name
            const match = req.files['attrImages'].find(
              (f) => f.originalname === val.attributeImageName,
            )
            if (match) imagePath = `/uploads/products/${match.filename}`
          }

          return {
            attributeValue: val.attributeValue,
            attributeSku: val.attributeSku || '',
            attributeRegularPriceInr: val.attributeRegularPriceInr || 0,
            attributeSalePriceInr: val.attributeSalePriceInr || 0,
            attributeRegularPriceUsd: val.attributeRegularPriceUsd || 0,
            attributeSalePriceUsd: val.attributeSalePriceUsd || 0,
            attributeStockStatus: val.attributeStockStatus ?? 1,
            attributeImage: imagePath,
          }
        }),
      }))
    }

    // ---------------- Handle main image & gallery ----------------
    let productMainImage = ''
    const productImages = []

    if (req.files && req.files['images']) {
      req.files['images'].forEach((file, index) => {
        const filePath = `/uploads/products/${file.filename}`
        if (index === 0)
          productMainImage = filePath // first image = main
        else productImages.push(filePath) // rest = gallery
      })
    }

    // ---------------- Resolve category IDs ----------------
    // ---------------- Resolve category IDs and names ----------------

    // ---------------- Resolve category IDs and names ----------------
    let productCategories = []
    if (categoryNames && categoryNames.length > 0) {
      // categoryNames comes as stringified JSON from FormData, parse it
      const parsedCategories =
        typeof categoryNames === 'string' ? JSON.parse(categoryNames) : categoryNames

      // each item should be { _id, name } from frontend
      productCategories = parsedCategories.map((cat) => ({
        _id: cat._id,
        name: cat.name,
      }))
    }

    // ---------------- Resolve brand IDs and names ----------------
    // ---------------- Resolve brand IDs and names ----------------
    let productBrands = []
    if (brandNames && brandNames.length > 0) {
      const parsedBrands = typeof brandNames === 'string' ? JSON.parse(brandNames) : brandNames

      // each item should be { _id, name } from frontend
      productBrands = parsedBrands.map((brand) => ({
        _id: brand._id,
        name: brand.name,
      }))
    }

    // ---------------- Tags (IDs already sent from frontend) ----------------
    const tagIdsFinal = tagIds // directly use

    // ---------------- Create product ----------------
    const product = new Product({
      productName,
      productSlug: uniqueSlug,
      productSku,
      productShortDescription,
      productLongDescription,
      productCategories,
      productBrands,
      productTags: tagIdsFinal,
      productAttributes: attributes,
      productMainImage,
      productImages,
      productRegularPriceInr,
      productSalePriceInr,
      productRegularPriceUsd,
      productSalePriceUsd,
      productStock: productStock ?? 1, // Fixed field name
      productWeight,
      productDimensions,
    })

    await product.save()

    return res.status(201).json({ success: true, product })
  } catch (err) {
    console.error('Create product error: - productController.js:191', err)
    return res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
}

export const deleteProducts = async (req, res) => {
  try {
    const { ids } = req.body // expecting { ids: [id1, id2, ...] }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No product IDs provided' })
    }

    // Delete all given IDs
    await Product.deleteMany({ _id: { $in: ids } })

    return res.status(200).json({ success: true, message: 'Products deleted successfully' })
  } catch (err) {
    console.error('Delete products error: - productController.js:211', err)
    return res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
}

export const updateProductsStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { productStock } = req.body

    if (!id) {
      return res.status(400).json({ success: false, message: 'Product ID is required' })
    }

    if (productStock !== 0 && productStock !== 1) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid stock value (must be 0 or 1)' })
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, { productStock }, { new: true })

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    return res.status(200).json({
      success: true,
      message: 'Product stock updated successfully',
      product: updatedProduct,
    })
  } catch (err) {
    console.error('Update status error: - productController.js:231', err)
    return res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
}

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params

    let product = await Product.findById(id)
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    const payload = req.body

    // ---------------- Basic fields ----------------
    product.productName = payload.productName || product.productName
    product.productSlug = payload.productSlug || product.productSlug
    product.productSku = payload.productSku || product.productSku
    product.productShortDescription =
      payload.productShortDescription || product.productShortDescription
    product.productLongDescription =
      payload.productLongDescription || product.productLongDescription
    product.productRegularPriceInr =
      payload.productRegularPriceInr ?? product.productRegularPriceInr
    product.productSalePriceInr = payload.productSalePriceInr ?? product.productSalePriceInr
    product.productRegularPriceUsd =
      payload.productRegularPriceUsd ?? product.productRegularPriceUsd
    product.productSalePriceUsd = payload.productSalePriceUsd ?? product.productSalePriceUsd
    product.productStock = payload.productStock ?? product.productStock
    product.productWeight = payload.productWeight ?? product.productWeight

    // ---------------- Dimensions ----------------
    if (payload.productDimensions) {
      product.productDimensions =
        typeof payload.productDimensions === 'string'
          ? JSON.parse(payload.productDimensions)
          : payload.productDimensions
    } else if (payload.productLength || payload.productWidth || payload.productHeight) {
      product.productDimensions = {
        length: payload.productLength || product.productDimensions.length,
        width: payload.productWidth || product.productDimensions.width,
        height: payload.productHeight || product.productDimensions.height,
      }
    }

    // ---------------- Categories ----------------
    if (payload.categories || payload.productCategories) {
      let categoriesData = payload.productCategories || payload.categories
      if (typeof categoriesData === 'string') categoriesData = JSON.parse(categoriesData)
      product.productCategories = categoriesData
    }

    // ---------------- Brands ----------------
    if (payload.brands || payload.productBrands) {
      let brandsData = payload.productBrands || payload.brands
      if (typeof brandsData === 'string') brandsData = JSON.parse(brandsData)
      product.productBrands = brandsData
    }

    // ---------------- Tags ----------------
    if (payload.tags || payload.productTags) {
      let tagsData = payload.productTags || payload.tags
      if (Array.isArray(tagsData)) {
        if (typeof tagsData[0] === 'string' && tagsData[0].startsWith('[')) {
          tagsData = JSON.parse(tagsData[0]).map((t) => t.name)
        } else if (tagsData[0]?._id && tagsData[0]?.name) {
          tagsData = tagsData.map((t) => t.name)
        }
      }
      product.productTags = tagsData
    }

    // ---------------- Attributes ----------------
    if (payload.attributes || payload.productAttributes) {
      let attrs = payload.productAttributes || payload.attributes
      if (typeof attrs === 'string') attrs = JSON.parse(attrs)

      attrs.forEach((attr) => {
        attr.attributeValues.forEach((val) => {
          if (val.attributeImageName && val.attributeImageName.trim() !== '') {
            val.attributeImage = val.attributeImageName
          }
          delete val.attributeImageName
        })
      })

      product.productAttributes = attrs
    }

    // Main Image
    if (req.files?.mainImage && req.files.mainImage.length > 0) {
      product.productMainImage = `/uploads/products/${req.files.mainImage[0].filename}`
    }

    // ---------------- Gallery Images ----------------
    if (req.files?.images && req.files.images.length > 0) {
      product.productImages = [
        ...(product.productImages || []),
        ...req.files.images.map((f) => `/uploads/products/${f.filename}`),
      ]
    }

    // ---------------- Attribute Images ----------------
    if (req.files?.attrImages && req.files.attrImages.length > 0) {
      let attrIndex = 0
      product.productAttributes.forEach((attr) => {
        attr.attributeValues.forEach((val) => {
          if (req.files.attrImages[attrIndex]) {
            val.attributeImage = `/uploads/products/${req.files.attrImages[attrIndex].filename}`
          }
          attrIndex++
        })
      })
    }

    product.updatedAt = Date.now()
    await product.save()

    return res.status(200).json({ success: true, product })
  } catch (err) {
    console.error('Update product error:  updateProduct - productController.js:350', err)
    return res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
}

//Checkpoinit
export const importProductsFromCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' })
    }

    const filePath = req.file.path
    const rows = []

    fs.createReadStream(filePath)
      .pipe(
        csvParser({
          mapHeaders: ({ header }) => header.replace(/^\ufeff/, '').trim(), // BOM + trim
        }),
      )
      .on('data', (row) => rows.push(row))
      .on('end', async () => {
        try {
          const imported = []

          for (const row of rows) {
            console.log('================================== - productController.js:378')
            console.log(
              'RAW ROW FROM CSV: - productController.js:379',
              JSON.stringify(row, null, 2),
            )
            console.log('================================== - productController.js:380')

            // ---------------- Product Name ----------------
            const productName =
              row.productName?.trim() || row['post_title']?.trim() || 'Unnamed Product'

            // Slug
            const baseSlug = slugify(productName, { lower: true, strict: true })
            let uniqueSlug = baseSlug
            let counter = 1
            while (await Product.findOne({ productSlug: uniqueSlug })) {
              uniqueSlug = `${baseSlug}-${counter}`
              counter++
            }

            console.log(
              'RAW TAG FIELD (row["product_tag"]): - productController.js:395',
              row['product_tag'],
            )

            // ---------------- Tags ----------------
            let productTags = []
            if (row['product_tag']) {
              const tags = row['product_tag']
                .split('|')
                .map((t) => t.trim())
                .filter((t) => t)

              productTags = tags.map((tagName) => ({
                _id: `${Date.now()}-${Math.floor(Math.random() * 1000000)}`, // unique string ID
                name: tagName,
              }))
            }

            console.log('DEBUG: Parsed Tags: - productController.js:411', productTags)

            let productCategories = []

            if (row.product_cat) {
              // Split by '|' to get individual segments
              const segments = row.product_cat
                .split('|')
                .map((s) => s.trim())
                .filter((s) => s)

              // Map each segment to an object with _id and last part after '>'
              productCategories = segments.map((seg) => {
                const mainCategoryName = seg.split('>').pop().trim()
                return {
                  _id: new mongoose.Types.ObjectId(), // valid ObjectId
                  name: mainCategoryName,
                }
              })
            }

            let productBrands = []

            if (row.product_brand) {
              // Split by '|' to get individual brand segments
              const brandSegments = row.product_brand
                .split('|')
                .map((s) => s.trim())
                .filter((s) => s)

              // Map each segment into {_id, name}
              productBrands = brandSegments.map((seg) => {
                const mainBrandName = seg.split('>').pop().trim()
                return {
                  _id: new mongoose.Types.ObjectId(), // valid ObjectId for schema
                  name: mainBrandName,
                }
              })
            }

            console.log('DEBUG: Parsed productBrands: - productController.js:449', productBrands)

            // ---------------- Attributes ----------------
            const productAttributes = []
            const attributeMapping = {
              'pa_country-of-origin': 'Country Of Origin',
              pa_brands: 'Brands',
              pa_quantity_multiple: 'QUANTITY MULTIPLE',
              'pa_shoe-size-required': 'Shoe Size Required',
            }
            Object.keys(attributeMapping).forEach((attrKey) => {
              if (row[`attribute:${attrKey}`] && row[`attribute:${attrKey}`].trim() !== '') {
                productAttributes.push({
                  attributeName: attributeMapping[attrKey],
                  attributeValues: [
                    {
                      attributeValue: row[`attribute:${attrKey}`].trim(),
                      attributeSku: '',
                      attributeRegularPriceInr: 0,
                      attributeSalePriceInr: 0,
                      attributeRegularPriceUsd: 0,
                      attributeSalePriceUsd: 0,
                      attributeStockStatus: 1,
                      attributeImage: '',
                    },
                  ],
                })
              }
            })

            let productMainImage = ''
            if (row.images) {
              // Take everything before "! alt"
              productMainImage = row.images.split('! alt')[0].trim()
            }

            // ---------------- Final Payload ----------------
            const payload = {
              oldProductID: row.ID || null,
              productName,
              productSlug: uniqueSlug,
              productSku: row.sku || '',
              productShortDescription: row.short_descp || '',
              productLongDescription: row.long_descp || '',
              productCategories,
              productBrands,
              productTags,
              productAttributes,
              // productMainImage: row.images || "",
              productMainImage,
              productImages: [],
              productRegularPriceInr: parseFloat(row.regular_price) || 0,
              productSalePriceInr: parseFloat(row.sale_price) || 0,
              productRegularPriceUsd: 0,
              productSalePriceUsd: 0,
              productStock: row.stock_status === 'instock' ? 1 : 0,
              productWeight: 0,
              productDimensions: { length: 0, width: 0, height: 0 },
            }

            console.log(
              'FINAL PAYLOAD BEFORE DB SAVE: - productController.js:513',
              JSON.stringify(payload, null, 2),
            )
            console.log('================================== - productController.js:514')

            // ---------------- Upsert ----------------
            const saved = await Product.findOneAndUpdate(
              { oldProductID: payload.oldProductID },
              payload,
              { upsert: true, new: true },
            )
            imported.push(saved)
          }

          return res.status(200).json({
            success: true,
            message: 'CSV imported successfully',
            imported: imported.length,
          })
        } catch (err) {
          console.error('CSV DB Save Error: - productController.js:532', err)
          return res.status(500).json({ success: false, message: 'DB error', error: err.message })
        }
      })
  } catch (err) {
    console.error('CSV Import Error: - productController.js:538', err)
    return res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
}
