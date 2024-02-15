const { model, Schema } = require("mongoose");

const eventSchema = new Schema({
    title:          { type: String, required: true                               },
    description:    { type: String, required: true                               },
    image:          { type: String, required: true, default: "/images/Plant.png" },
    eventcode:      { type: String, required: true                               },
});

const Event = model("event", eventSchema);
module.exports = Event;
