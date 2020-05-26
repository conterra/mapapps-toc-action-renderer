/*
 * Copyright (C) 2020 con terra GmbH (info@conterra.de)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import registerSuite from "intern!object";
import assert from "intern/chai!assert";
import module from  "module";
import tocRendererChangerFactory from "../tocRendererChangerFactory";

registerSuite({
    name: md.id,
    "expect that 1 added to 1 equals 2": function () {
        var test = new tocRendererChangerFactory ();
        // exchange this with a more clever test ;)
        var result = 1 + 1;
        assert.equal(result, 2);
    }
});
