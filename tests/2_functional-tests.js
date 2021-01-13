const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const mongoose = require("mongoose")
const Issue = require("../db/IssueModel");
const { query } = require('express');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  const issueAllFields = {
    issue_title: "Fix error in posting data",
    issue_text: "When we post data it has an error.",
    created_on: "2017-01-08T06:35:14.240Z",
    updated_on: "2017-01-08T06:35:14.240Z",
    created_by: "Joe",
    assigned_to: "Joe",
    open: true,
    status_text: "In QA"
  }
  const issueRequiredFields = {
    issue_title: "Fix error in posting data",
    issue_text: "When we post data it has an error.",
    created_by: "Joe",
  }

  const issueOptionalFields = {
    issue_title: "Fix error in posting data",
    issue_text: "When we post data it has an error.",
    created_by: "Joe",
    assigned_to: "Joe",
    status_text: "In QA"
  }
  suite('POST Route tests', function () {

    teardown((done) => {
      mongoose.connection.collections.issues.drop(() => {
        done()
      })
    });

    test('Create an issue with every field: POST request to /api/issues/{project}', function (done) {
      chai.request(server)
        .post('/api/issues/apitest')
        .send(issueOptionalFields)
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isObject(res.body)
          assert.exists(res.body._id)
          assert.equal(res.body.issue_title, "Fix error in posting data")
          done();
        });
    });

    test('Create an issue with only required fields: POST request to /api/issues/{project}', function (done) {
      chai.request(server)
        .post('/api/issues/apitest')
        .send(issueRequiredFields)
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isObject(res.body)
          assert.exists(res.body._id)
          assert.equal(res.body.issue_title, "Fix error in posting data")
          done();
        });
    });

    test('Create an issue with missing required fields: POST request to /api/issues/{project}}', function (done) {
      chai.request(server)
        .post('/api/issues/apitest')
        .send({ assigned_to: "Joe", issue_title: "Fix error in posting data" })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "required field(s) missing")
          done();
        });
    });

  });

  suite('GET Route tests', function () {
    setup((done) => {
      const newIssue = new Issue(issueAllFields);
      newIssue.save((error, issue) => {
        if (error) console.log(error)
        done();
      })
    });

    teardown((done) => {
      mongoose.connection.collections.issues.drop(() => {
        done()
      })
    });

    test('View issues on a project: GET request to /api/issues/{project}', function (done) {
      chai.request(server)
        .get('/api/issues/apitest')
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body)
          assert.equal(res.body.length, 1)
          done();
        });
    });

    test('View issues on a project with one filter: GET request to /api/issues/{project}', function (done) {
      chai.request(server)
        .get('/api/issues/apitest')
        .query({ assigned_to: "Joe", })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body)
          assert.equal(res.body.length, 1)
          done();
        });
    });

    test('View issues on a project with multiple filters: GET request to /api/issues/{project}', function (done) {
      chai.request(server)
        .get('/api/issues/apitest')
        .query({ assigned_to: "Joe", issue_title: "Fix error in posting data" })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body)
          assert.equal(res.body.length, 1)
          done();
        });
    });

  });

  suite('PUT Route tests', function () {
    let testId;
    setup((done) => {
      const newIssue = new Issue(issueAllFields);
      newIssue.save((error, issue) => {
        if (error) console.log(error)
        testId = issue._id
        done();
      })
    });

    teardown((done) => {
      mongoose.connection.collections.issues.drop(() => {
        done()
      })
    });

    test('Update one field on an issue: PUT request to /api/issues/{project}', function (done) {
      chai.request(server)
        .put('/api/issues/apitest')
        .send({ _id: testId, status_text: "In QA PUT UPDATE" })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isObject(res.body)
          assert.exists(res.body._id)
          assert.equal(res.body._id, testId)
          assert.equal(res.body.status_text, "In QA PUT UPDATE")
          done();
        });
    });

    test('Update multiple fields on an issue: PUT request to /api/issues/{project}', function (done) {
      chai.request(server)
        .put('/api/issues/apitest')
        .send({ _id: testId, status_text: "In QA PUT UPDATE", created_by: "Joe PUT UPDATE", })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isObject(res.body)
          assert.exists(res.body._id)
          assert.equal(res.body._id, testId)
          assert.equal(res.body.created_by, "Joe PUT UPDATE")
          assert.equal(res.body.status_text, "In QA PUT UPDATE")
          done();
        });
    });

    test('Update an issue with missing _id: PUT request to /api/issues/{project}', function (done) {
      chai.request(server)
        .put('/api/issues/apitest')
        .send({ status_text: "In QA PUT UPDATE" })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'missing _id')
          done();
        });
    });

    test('Update an issue with no fields to update: PUT request to /api/issues/{project}', function (done) {
      chai.request(server)
        .put('/api/issues/apitest')
        .send({ _id: testId })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'no update field(s) sent')
          assert.equal(res.body._id, testId)
          done();
        });
    });

    test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', function (done) {
      chai.request(server)
        .put('/api/issues/apitest')
        .send({ _id: 'testId', status_text: "In QA PUT UPDATE" })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'could not update')
          assert.equal(res.body._id, 'testId')
          done();
        });
    });
  });

  suite('DELETE Route tests', function () {
    let testId;
    setup((done) => {
      const newIssue = new Issue(issueAllFields);
      newIssue.save((error, issue) => {
        if (error) console.log(error)
        testId = issue._id
        done();
      })
    });

    teardown((done) => {
      mongoose.connection.collections.issues.drop(() => {
        done()
      })
    });

    test('Delete an issue: DELETE request to /api/issues/{project}', function (done) {
      chai.request(server)
        .delete('/api/issues/apitest')
        .send({ _id: testId })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isObject(res.body)
          assert.exists(res.body._id)
          assert.equal(res.body._id, testId)
          assert.equal(res.body.result, "successfully deleted")
          done();
        });
    });


    test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', function (done) {
      chai.request(server)
        .delete('/api/issues/apitest')
        .send({ _id: 'testId' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'could not delete')
          assert.equal(res.body._id, 'testId')
          done();
        });
    });

    test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', function (done) {
      chai.request(server)
        .delete('/api/issues/apitest')
        .send({})
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'missing _id')

          done();
        });
    });
  });
});
