import test from "node:test";
import assert from "node:assert/strict";
import { determineWinner } from "../game/rooms/gameLoop.js";
import { handleFlagPickup } from "../game/engine.js";

test("determineWinner calculates player with highest possession time", () => {
    const mockRoom = {
        players: {
            "p1": { id: "p1", username: "Alice", color: "#ff2d78", possessionTime: 12000 },
            "p2": { id: "p2", username: "Bob", color: "#00f5ff", possessionTime: 45000 },
            "p3": { id: "p3", username: "Charlie", color: "#ffd700", possessionTime: 5000 },
        }
    };

    const winner = determineWinner(mockRoom);
    assert.ok(winner);
    assert.equal(winner.id, "p2");
    assert.equal(winner.username, "Bob");
    assert.equal(winner.possessionTime, 45000);
});

test("handleFlagPickup updates carrier role and disarms weapon", () => {
    const mockRoom = { flag: { holderId: null, x: 0, z: 0 } };
    const mockPlayer = { id: "p1", username: "Alice", hasFlag: false, hasWeapon: true };

    handleFlagPickup(null, "room_1", mockRoom, mockPlayer);

    assert.equal(mockRoom.flag.holderId, "p1");
    assert.equal(mockPlayer.hasFlag, true);
    assert.equal(mockPlayer.hasWeapon, false);
});
