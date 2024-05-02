process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db')

let testInvoice;

beforeEach(async() => {
    await db.query(`DELETE FROM invoices`);
    await db.query(`DELETE FROM companies`);
    await db.query("SELECT setval('invoices_id_seq', 1, false)");

    await db.query(`INSERT INTO companies (code, name, description) VALUES ('test','testCompany', 'a company to test') RETURNING code, name, description`)
    const result = await db.query(`INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date) 
                                    VALUES ('test', 100, false, '2000-01-01', null) RETURNING id`);
    testInvoice = result.rows[0]
})

afterEach(async() => {
    await db.query(`DELETE FROM invoices`)
})

afterAll(async() => {
    await db.end()
})

describe("GET /invoices", () =>{
    test("Get a list of all invoices", async() =>{
        const result = await request(app).get('/invoices')
        expect(result.statusCode).toBe(200);
        expect(result.body).toEqual({invoices: [
            {id: 1, comp_code: "test"}]})
    })
})

describe("GET /invoices/:id", () =>{
    test("Get a single invoice", async() =>{
        const result = await request(app).get(`/invoices/1`)
        expect(result.statusCode).toBe(200);
        expect(result.body).toEqual(
            {
            "invoice": {
                id: 1,
                amt: 100,
                add_date: `2000-01-01T05:00:00.000Z`,
                paid: false,
                paid_date: null,
                comp_code: 'test'
            }
        })
    })
}
)

describe("POST /invoices", () =>{
    test("Post an invoice", async() =>{
        const result = await request(app).post('/invoices').send({ comp_code: "test", amt: 100 });
        expect(result.statusCode).toBe(201);
        expect(result.body).toEqual({
            "invoice": {
                id: 2,
                amt: 100,
                paid: false,
                paid_date: null,
                comp_code: 'test'
        }
    })
})
}
)

describe("PUT /invoices/:id", () =>{
    test("Edit an invoice", async() =>{
        const result = await request(app).put('/invoices/1').send({ id: 1, amt: 200})
        expect(result.statusCode).toBe(201);
        expect(result.body).toEqual({
            invoice: {
                id: 1,
                comp_code: "test", 
                amt: 200,
                paid: false,
                paid_date: null
            }
        })
    })
})

describe("DELETE /invoices/:id", () =>{
    test("Delete an invoice", async() =>{
        const result = await request(app).delete('/invoices/1')
        expect(result.statusCode).toBe(200);
        expect(result.body).toEqual({
            status: "DELETED"
        })
    })
})