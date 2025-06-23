import React from "react";
import EventsComponent from "./EventsComponent";
import { eventConfigurations } from "../utils/eventConfigurations";

const HomeJoinComponent = () => {
    return (
        <div className="grid justify-center items-center pb-28 pt-32">
          <EventsComponent {...eventConfigurations.create} />
          <EventsComponent {...eventConfigurations.join} />
          <EventsComponent {...eventConfigurations.staff} />
        </div>
    );
};

export default HomeJoinComponent;