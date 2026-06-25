import { Router } from 'express';
import Employee from '../models/Employee.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { id, name, role, dept } = req.body;
    if (!id || !name) return res.status(400).json({ error: 'id and name required' });
    const emp = await Employee.create({ id: id.toUpperCase(), name, role, dept });
    res.status(201).json(emp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const emp = await Employee.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!emp) return res.status(404).json({ error: 'Employee not found' });
    res.json(emp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const emp = await Employee.findOneAndDelete({ id: req.params.id });
    if (!emp) return res.status(404).json({ error: 'Employee not found' });
    res.json({ message: 'Deleted', emp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
