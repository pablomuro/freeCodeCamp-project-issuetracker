"use strict";

const DEFAULT_PROJECT_NAME = "apitest";
const errorObject = {
  validate: { error: "required field(s) missing" },
  missingId: { error: 'missing _id' }
};

const Issue = require("../db/IssueModel");


module.exports = function (app) {
  app
    .route("/api/issues/:project")

    .get(async function (req, res) {
      let project = req.params.project;
      project = DEFAULT_PROJECT_NAME;

      const query = req.query
      let result = null;
      try {
        if (Object.entries(query).length) {
          result = await Issue.find(query).exec();
        } else {
          result = await Issue.find().exec();
        }

        res.json(result);
      } catch (error) {
        console.log(error)
        res.json([])
      }

    })

    .post(async function (req, res) {
      let project = req.params.project;
      project = DEFAULT_PROJECT_NAME;

      const body = req.body
      const issue = new Issue(body);
      if (issue.validateSync()) {
        res.json(errorObject.validate);
        return;
      }

      try {
        let newIssue = await issue.save();
        res.json(newIssue)
        return
      } catch (error) {
        res.json(error);
        return;
      }


    })

    .put(async function (req, res) {
      let project = req.params.project;
      project = DEFAULT_PROJECT_NAME;
      const body = req.body
      const _id = req.body._id
      delete body._id
      const updateFields = {}
      Object.entries(body).map(obj => {
        const [key, value] = [...obj]
        if (value) { updateFields[key] = value }
      })
      if (!_id) {
        res.json(errorObject.missingId)
        return
      }
      if (!Object.entries(updateFields).length) {
        res.json({ error: 'no update field(s) sent', '_id': _id })
        return
      }

      try {
        const updatedIssue = await Issue.findByIdAndUpdate(_id, body, { new: true }).exec()
        res.json(updatedIssue)
        return
      } catch (error) {
        res.json({ error: 'could not update', '_id': _id })
        return
      }
    })

    .delete(async function (req, res) {
      let project = req.params.project;
      project = DEFAULT_PROJECT_NAME;
      const _id = req.body._id
      if (!_id) {
        res.json(errorObject.missingId)
        return
      }
      try {
        await Issue.findByIdAndDelete(_id).exec()
        res.json({ result: 'successfully deleted', '_id': _id })
      } catch (error) {
        res.json({ error: 'could not delete', '_id': _id })
        return
      }
    });
};
