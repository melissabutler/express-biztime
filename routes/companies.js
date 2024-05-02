const express = require("express");
const db = require("../db");
const { route } = require("../app");
const ExpressError = require("../expressError");
const router = express.Router();
const slugify = require("slugify")

router.get('/', async function(req, res, next) {
    try {
        const results = await db.query(`SELECT * FROM companies`);
        return res.json({ companies: results.rows})
    } catch(err){
        return next(err);
    }
})

router.get('/:code', async function(req, res, next) {
    try {
        const { code } = req.params;

        const compResults = await db.query(`SELECT * FROM companies WHERE code = $1`, [code]);

        const invoiceResults = await db.query(`SELECT * FROM invoices WHERE comp_code = $1 ORDER BY id`, [code]);

        if(compResults.rows.length === 0) {
            throw new ExpressError(`Cannot locate company with code of '${code}'`, 404)
        }
        const company = compResults.rows[0];
        if (invoiceResults.rows.length !== 0){
            const invoices = invoiceResults.rows;

            company.invoices = invoices
        }
        

        return res.json({ "company": company})
    } catch(err) {
        return next(err);
    }
})

router.post('/', async function(req, res, next) {
    try {
        const { name, description } = req.body;
        let code = slugify(name, {lower: true})
        const results = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1 , $2, $3) RETURNING code, name, description`, [code, name, description]);
        return res.status(201).json({ company: results.rows[0]})
    } catch(err){
        return next(err);
    }
})

router.put('/:code', async function(req, res, next) {
    try {
        const { code } = req.params;
        const { name, description } = req.body;
        const results = await db.query(`UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description`, [name, description, code]);
        if (results.rows.length === 0 ) {
            throw new ExpressError(`Can't update company with code of ${code}`, 404)
        }
        return res.send({ company: results.rows[0]})
    } catch(err){
        return next(err);
    }
})

router.delete('/:code', async function(req, res, next) {
    try {
        const results = db.query(`DELETE FROM companies WHERE code = $1`, [req.params.code])
        return res.send({ status: "DELETED"})
    } catch(err){
        return next(err);
    }
})

module.exports = router;