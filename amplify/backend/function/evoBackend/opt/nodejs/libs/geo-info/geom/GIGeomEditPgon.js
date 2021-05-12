"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("../common");
const arrs_1 = require("../../util/arrs");
const vectors_1 = require("../../geom/vectors");
/**
 * Class for geometry.
 */
class GIGeomEditPgon {
    /**
     * Constructor
     */
    constructor(modeldata, geom_maps) {
        this.modeldata = modeldata;
        this._geom_maps = geom_maps;
    }
    /**
     * Creates one or more holes in a polygon.
     * Updates time stamp for the polygon.
     * ~
     */
    cutPgonHoles(pgon_i, posis_i_arr) {
        // get the normal of the face
        const face_normal = this.modeldata.geom.query.getPgonNormal(pgon_i);
        // make the wires for the holes
        const hole_wires_i = [];
        for (const hole_posis_i of posis_i_arr) {
            const hole_vert_i_arr = hole_posis_i.map(posi_i => this.modeldata.geom.add._addVertex(posi_i));
            const hole_edges_i_arr = [];
            for (let i = 0; i < hole_vert_i_arr.length - 1; i++) {
                hole_edges_i_arr.push(this.modeldata.geom.add._addEdge(hole_vert_i_arr[i], hole_vert_i_arr[i + 1]));
            }
            hole_edges_i_arr.push(this.modeldata.geom.add._addEdge(hole_vert_i_arr[hole_vert_i_arr.length - 1], hole_vert_i_arr[0]));
            const hole_wire_i = this.modeldata.geom.add._addWire(hole_edges_i_arr, true);
            // get normal of wire and check if we need to reverse the wire
            const wire_normal = this.modeldata.geom.query.getWireNormal(hole_wire_i);
            if (vectors_1.vecDot(face_normal, wire_normal) > 0) {
                this.modeldata.geom.edit_topo.reverse(hole_wire_i);
            }
            // add to list of holes
            hole_wires_i.push(hole_wire_i);
        }
        // create the holes, does everything at face level
        this._cutPgonHoles(pgon_i, hole_wires_i);
        // update the time stamp
        // snapshot: new ts no longer required
        // this.modeldata.geom.timestamp.updateObjsTs(EEntType.PGON, pgon_i);
        // no need to change either the up or down arrays
        // return the new wires
        return hole_wires_i;
    }
    /**
     * Retriangulate the polygons.
     * Updates time stamp for the polygons.
     * ~
     */
    triPgons(pgons_i) {
        if (!Array.isArray(pgons_i)) {
            const pgon_i = pgons_i;
            const wires_i = this.modeldata.geom.nav.navAnyToWire(common_1.EEntType.PGON, pgon_i);
            const outer_i = wires_i[0];
            const holes_i = wires_i.slice(1);
            // create the triangles
            const new_tris_i = this.modeldata.geom.add._addTris(outer_i, holes_i);
            // delete the old trianges
            const old_pgon_tris_i = this._geom_maps.dn_pgons_tris.get(pgon_i);
            for (const old_face_tri_i of old_pgon_tris_i) {
                // verts to tris
                for (const vert_i of this._geom_maps.dn_tris_verts.get(old_face_tri_i)) {
                    const vert_tris_i = this._geom_maps.up_verts_tris.get(vert_i);
                    arrs_1.arrRem(vert_tris_i, old_face_tri_i);
                }
                // tris to verts
                this._geom_maps.dn_tris_verts.delete(old_face_tri_i);
                // tris to faces
                this._geom_maps.up_tris_pgons.delete(old_face_tri_i);
            }
            // update up array for tri to pgon
            for (const new_tri_i of new_tris_i) {
                this._geom_maps.up_tris_pgons.set(new_tri_i, pgon_i);
            }
            // update down array for pgon to tri
            this._geom_maps.dn_pgons_tris.set(pgon_i, new_tris_i);
        }
        else { // An array of pgons
            pgons_i.forEach(pgon_i => this.triPgons(pgon_i));
        }
    }
    // ============================================================================
    // Private methods
    // ============================================================================
    /**
     * Adds a hole to a face and updates the arrays.
     * Wires are assumed to be closed!
     * This also calls addTris()
     * @param wire_i
     */
    _cutPgonHoles(pgon_i, hole_wires_i) {
        // get the wires and triangles arrays
        const pgon_wires_i = this._geom_maps.dn_pgons_wires.get(pgon_i);
        const old_pgon_tris_i = this._geom_maps.dn_pgons_tris.get(pgon_i);
        // get the outer wire
        const outer_wire_i = pgon_wires_i[0];
        // get the hole wires
        const all_hole_wires_i = [];
        if (pgon_wires_i.length > 1) {
            pgon_wires_i.slice(1).forEach(wire_i => all_hole_wires_i.push(wire_i));
        }
        hole_wires_i.forEach(wire_i => all_hole_wires_i.push(wire_i));
        // create the triangles
        const new_tris_i = this.modeldata.geom.add._addTris(outer_wire_i, all_hole_wires_i);
        // create the wires
        const new_wires_i = pgon_wires_i.concat(hole_wires_i);
        // update down arrays
        this._geom_maps.dn_pgons_wires.set(pgon_i, new_wires_i);
        this._geom_maps.dn_pgons_tris.set(pgon_i, new_tris_i);
        // update up arrays
        hole_wires_i.forEach(hole_wire_i => this._geom_maps.up_wires_pgons.set(hole_wire_i, pgon_i));
        new_tris_i.forEach(tri_i => this._geom_maps.up_tris_pgons.set(tri_i, pgon_i));
        // delete the old trianges
        for (const old_face_tri_i of old_pgon_tris_i) {
            // remove these deleted tris from the verts
            for (const vert_i of this._geom_maps.dn_tris_verts.get(old_face_tri_i)) {
                const tris_i = this._geom_maps.up_verts_tris.get(vert_i);
                arrs_1.arrRem(tris_i, old_face_tri_i);
            }
            // tris to verts
            this._geom_maps.dn_tris_verts.delete(old_face_tri_i);
            // tris to faces
            this._geom_maps.up_tris_pgons.delete(old_face_tri_i);
        }
        // return the numeric index of the pgon
        return pgon_i;
    }
    /**
     * Updates the tris in a face
     * @param pgon_i
     */
    _updatePgonTris(pgon_i) {
        const wires_i = this._geom_maps.dn_pgons_wires.get(pgon_i);
        // get the wires
        const border_wire_i = wires_i[0];
        // get the border and holes
        const holes_wires_i = wires_i.slice(1);
        const tris_i = this.modeldata.geom.add._addTris(border_wire_i, holes_wires_i);
        // delete the old tris
        for (const tri_i of this._geom_maps.dn_pgons_tris.get(pgon_i)) {
            // update the verts
            const verts_i = this._geom_maps.dn_tris_verts.get(tri_i);
            for (const vert_i of verts_i) {
                this._geom_maps.up_verts_tris.delete(vert_i); // up
            }
            // tris to verts
            this._geom_maps.dn_tris_verts.delete(tri_i); // down
            // tris to pgons
            this._geom_maps.up_tris_pgons.delete(tri_i); // up
        }
        // update down arrays
        this._geom_maps.dn_pgons_tris.set(pgon_i, tris_i);
        // update up arrays
        for (const tri_i of tris_i) {
            this._geom_maps.up_tris_pgons.set(tri_i, pgon_i);
        }
    }
}
exports.GIGeomEditPgon = GIGeomEditPgon;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR0lHZW9tRWRpdFBnb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9nZW5fZXZhbF9wcm9jZXNzX2JhY2tlbmQvc3JjL2xpYnMvZ2VvLWluZm8vZ2VvbS9HSUdlb21FZGl0UGdvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHNDQUFzRDtBQUN0RCwwQ0FBeUM7QUFDekMsZ0RBQTRDO0FBRzVDOztHQUVHO0FBQ0gsTUFBYSxjQUFjO0lBR3ZCOztPQUVHO0lBQ0gsWUFBWSxTQUFzQixFQUFFLFNBQW9CO1FBQ3BELElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNCLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO0lBQ2hDLENBQUM7SUFDRDs7OztPQUlHO0lBQ0ksWUFBWSxDQUFDLE1BQWMsRUFBRSxXQUF1QjtRQUN2RCw2QkFBNkI7UUFDN0IsTUFBTSxXQUFXLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMxRSwrQkFBK0I7UUFDL0IsTUFBTSxZQUFZLEdBQWEsRUFBRSxDQUFDO1FBQ2xDLEtBQUssTUFBTSxZQUFZLElBQUksV0FBVyxFQUFFO1lBQ3BDLE1BQU0sZUFBZSxHQUFhLFlBQVksQ0FBQyxHQUFHLENBQUUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDMUcsTUFBTSxnQkFBZ0IsR0FBYSxFQUFFLENBQUM7WUFDdEMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGVBQWUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNqRCxnQkFBZ0IsQ0FBQyxJQUFJLENBQUUsSUFBSSxDQUFDLFNBQVMsQ0FB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