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

      let query = req.query
      let result = null;
      try {
        if (Object.entries(query).length) {
          query = {
            project,
            ...query
          }
          result = await Issue.find(query).exec();
        } else {
          result = await Issue.find({ project }).exec();
        }

        res.json(result);
        return;
      } catch (error) {
        console.log('eiie', error)
        res.json([])
        return;
      }

    })

    .post(async function (req, res) {
      let project = req.params.project;

      const body = req.body
      const issue = new Issue({ ...body, project });
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
        const issue = await Issue.findByIdAndUpdate(_id, body, { new: true }).exec()
        res.json({ result: 'successfully updated', '_id': issue._id })
        return
      } catch (error) {
        res.json({ error: 'could not update', '_id': _id })
        return
      }
    })

    .delete(async function (req, res) {
      let project = req.params.project;
      const _id = req.body._id
      if (!_id) {
        res.json(errorObject.missingId)
        return
      }
      try {
        const issue = await Issue.findByIdAndDelete(_id).exec()
        res.json({ result: 'successfully deleted', '_id': issue._id })
      } catch (error) {
        res.json({ error: 'could not delete', '_id': _id })
        return
      }
    });
};
