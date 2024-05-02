const express = require("express")
const db = require('../db');
const { route } = require("../app");
const ExpressError = require("../expressError")
const router = express.Router();

router.get('/', async function(req, res, next) {
    try {
        const results = await db.query(`SELECT id, comp_code FROM invoices`)
        return res.json({ invoices: results.rows})
    } catch(err) {
        return next(err);
    }
})

router.get('/:id', async function(req, res, next) {
    try {
        const { id } = req.params;
        const results = await db.query(`SELECT id, comp_code, amt, paid, add_date, paid_date 
                                        FROM invoices WHERE id = $1`, [id]);
        return res.json({ invoice: results.rows[0]})
    } catch(err) {
        return next(err);
    }
})

router.post('/', async function(req, res, next) {
    try {
        const { comp_code, amt} = req.body;
        const results = await db.query(`INSERT INTO invoices (comp_code, amt) 
                                        VALUES ($1, $2) 
                                        RETURNING id, comp_code, amt, paid, paid_date`, 
                                        [comp_code, amt]);
        return res.status(201).json({ invoice: results.rows[0]})
    } catch(err) {
        return next(err);
    }
})

router.put('/:id', async function(req, res, next) {
    try {
        const { id } = req.params;
        const { amt, paid } = req.body;
        let paidDate = null;
        let currentResult = await db.query(`SELECT paid FROM invoices WHERE id = $1`, [id]);

        if (currentResult.rows.length === 0){
            throw new ExpressError(`Invoice ${id} not found`, 404)
        }

        const currentPaidDate = currentResult.rows[0].paid_date

        if (!currentPaidDate && paid) {
            paidDate = new Date();
        } else if(!paid){
            paidDate = null;
        } else {
            paidDate = currentPaidDate;
        }
        
        const results = await db.query(`
                UPDATE invoices 
                SET amt=$1, paid=$2, paid_date=$3,
                WHERE id=$4
                RETURNING id, comp_code, amt, paid, add_date, paid_date`,
                 [amt, paid, paidDate, id]);
        return res.status(201).json({ invoice: results.rows[0]})
    } catch(err){
        return next(err);
    }
})

router.delete('/:id', async function(req, res, next) {
    try {
        const results = db.query(`DELETE FROM invoices WHERE id = $1`, [req.params.id])
        return res.send({status: "DELETED"})
    } catch(err){
        return next(err);
    }
})


module.exports = router;