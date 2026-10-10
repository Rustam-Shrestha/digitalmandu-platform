const express = require('express');
const router = express.Router();
const isAuthenticated = require('../../middlewares/isAuthenticated');
const Address = require('../../models/addressModel');

router.get('/', isAuthenticated, async (req, res) => {
    try {
        const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
        res.json({ data: addresses });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching addresses', error: err.message });
    }
});

router.post('/', isAuthenticated, async (req, res) => {
    try {
        const { label, street, city, state, zipCode, country, phone, isDefault } = req.body;
        if (isDefault) await Address.updateMany({ user: req.user._id }, { isDefault: false });
        const address = await Address.create({
            user: req.user._id,
            label, street, city, state, zipCode, country, phone, isDefault: !!isDefault
        });
        res.status(201).json({ data: address });
    } catch (err) {
        res.status(400).json({ message: 'Error creating address', error: err.message });
    }
});

router.patch('/:id', isAuthenticated, async (req, res) => {
    try {
        const address = await Address.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
        if (!address) return res.status(404).json({ message: 'Not found' });
        res.json({ data: address });
    } catch (err) {
        res.status(400).json({ message: 'Error updating address', error: err.message });
    }
});

router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        const del = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!del) return res.status(404).json({ message: 'Not found' });
        res.json({ message: 'Address deleted' });
    } catch (err) {
        res.status(400).json({ message: 'Error deleting address', error: err.message });
    }
});

router.patch('/:id/set-default', isAuthenticated, async (req, res) => {
    try {
        await Address.updateMany({ user: req.user._id }, { isDefault: false });
        const address = await Address.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { isDefault: true }, { new: true });
        if (!address) return res.status(404).json({ message: 'Not found' });
        res.json({ data: address });
    } catch (err) {
        res.status(400).json({ message: 'Error setting default', error: err.message });
    }
});

module.exports = router;
