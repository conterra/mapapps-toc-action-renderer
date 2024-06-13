/*
 * Copyright (C) 2024 con terra GmbH (info@conterra.de)
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
import { assert } from "chai";
import module from "module";
import TocRenderChangerFactory from "../TocRendererChangerWidgetFactory"

describe(module.id, function(){
    it("expect that 1 added to 1 equals 2", function () {
        const test = new TocRenderChangerFactory ();
        // TODO: exchange this with a more clever test ;)
        const result = 1 + 1;
        assert.equal(result, 2);
    });
});
