process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db')

let testCompany;

beforeEach(async() => {
    await db.query(`DELETE FROM companies`);
    const result = await db.query(`INSERT INTO companies (code, name, description) VALUES ('test','testCompany', 'a company to test') RETURNING code, name, description`);
    testCompany = result.rows[0]
})

afterEach(async() => {
    await db.query(`DELETE FROM companies`)
})

afterAll(async() => {
    await db.end()
})

describe("GET /companies", () =>{
    test("Get a list of all companies", async() =>{
        const result = await request(app).get('/companies')
        expect(result.statusCode).toBe(200);
        expect(result.body).toEqual({companies: [testCompany]})
    })
})

describe("GET /companies/:code", () =>{
    test("Gets a single company", async() => {
        const result = await request(app).get(`/companies/${testCompany.code}`)
        expect(result.statusCode).toBe(200);
        expect(result.body).toEqual({company: testCompany})
    })
    test("Responds with 404 for an invalid company code", async() =>{
        const result = await request(app).get(`/companies/nope`)
        expect(result.statusCode).toBe(404)
    })
})

describe("POST /companies", () =>{
    test("Creates a single company", async () =>{
        const result = await request(app).post('/companies').send({ code: 'test2', name: 'testCompany2', description: 'Woah a second'});
        expect(result.statusCode).toBe(201);
        expect(result.body).toEqual({
            company: {code: 'test2', name: 'testCompany2', description: 'Woah a second'}
        })
    })
})

describe("PUT /companies/:code", () =>{
    test("Updates a single company", async() => {
        const result = await request(app).put(`/companies/${testCompany.code}`).send({ code: 'test', name: 'newName', description: 'new description'});
        expect(result.statusCode).toBe(200);
        expect(result.body).toEqual({
            company: {
                code: 'test', name: 'newName', description: 'new description'
            }
            
        })
    })
})

describe("DELETE /companies/:code", () =>{
    test("Deletes a single company", async() =>{
        const result = await request(app).delete(`/companies/${testCompany.code}`);
        expect(result.statusCode).toBe(200);
        expect(result.body).toEqual({ status: "DELETED"})
    })
})