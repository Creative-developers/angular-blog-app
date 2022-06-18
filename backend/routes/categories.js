const express = require('express')
const Category = require('../models/Category')
const router = express.Router()

const {
    auth
} = require('../middleware/auth')

router.get('/', async(req, res) => {
    try {
        let categories = await Category.find()
        res.status(200).json({
            success: true,
            categories
        })
    } catch (err) {
        return res.status(500).json({
            error: err.message
        })
    }
})

router.post('/', auth, async(req, res) => {
    try {
        let category = await Category.create(req.body)
        if (category) {
            const {
                _id,
                name,
                slug
            } = category
            return res.status(201).json({
                success: true,
                category: {
                    _id,
                    name,
                    slug
                }
            })
        } else {
            return res.status(500).json({
                error: err.message
            })
        }
    } catch (err) {
        return res.status(500).json({
            error: err.message
        })
    }
})

router.put('/:categoryId', auth, async(req, res) => {
    try {
        let updatedCategory = {
            $set: {
                name: req.body.name,
                slug: req.body.slug
            }
        }
        const result = await Category.updateOne({
            _id: req.params.categoryId
        }, updatedCategory)
        if (result.matchedCount !== 1) return res.status(500).json({
            success: false,
            message: 'Something went wrong in updating the category data'
        })
        else {
            return res.status(200).json({
                success: true,
                message: 'Category updated successfully',
                category: req.body
            })
        }
    } catch (err) {
        return res.status(500).json({
            error: err.message
        })
    }
})

router.delete('/', auth, async(req, res) => {
    try {
        await Category.deleteMany({}).exec().then(() => {
            return res.status(200).json({
                success: true,
                message: 'Categories deleted successfully'
            })
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Something went wrong.',
            error: err
        })
    }
})

router.delete('/:categoryId', auth, async(req, res) => {
    try {

        let category = await Category.findById(req.params.categoryId)
        if (!category) {
            return res.status(401).json({
                success: false,
                message: 'Category not found'
            })
        } else {
            await category.remove()
            return res.status(200).json({
                success: true,
                message: 'Category deleted',
                category
            })
        }
    } catch (err) {
        return res.status(500).json({
            error: err.message
        })
    }
})

module.exports = router