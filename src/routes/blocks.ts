import express from 'express';
import { chains } from '../config/constants';

const router = express.Router();

router.get('/:chain', async (req, res) => {
  try {
    const chain = req.params.chain
    const chainData = chains.find(chainData => chainData.name===chain)
    if (!chainData) {
      res.status(404).json({ message: 'Chain not found' });
    } else {
      const blocks = await chainData.model.findMany({
        orderBy: { number: 'desc' },
        take: 100
      });
      res.json(blocks)
    }
  } catch (error) {
    console.error((error as Error).message)
    res.status(500).json({ message: "Something went wrong" });
  }
});

export default router;