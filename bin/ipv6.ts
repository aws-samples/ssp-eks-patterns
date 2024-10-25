import { configureApp } from "../lib/common/construct-utils";
import IpV6Construct from "../lib/ipv6-construct";

const app = configureApp();

new IpV6Construct().build(app, "ipv6");
