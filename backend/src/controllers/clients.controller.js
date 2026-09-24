
export const addClient = async function (req, res) {
    const userId = req?.user.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { business_id, company_name, contact_person, email, phone_number, address, tax_id, registration_number } = req.body;

    if (!business_id || !company_name || !contact_person || !email) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const result = await req.db.query(
            `INSERT INTO clients (business_id, company_name, contact_person, email, phone_number, address, tax_id, registration_number)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [business_id, company_name, contact_person, email, phone_number || null, address || null, tax_id || null, registration_number || null]
        )

        if (!result.rows[0]) {
            return res.status(500).json({ message: 'Failed to add client' });
        }

        return res.status(201).json({
            message: 'Client added successfully',
            client: result.rows[0],
        });
    } catch (error) {
        console.error('addClient error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }

}

export const getClients = async function (req, res) 
{
    const userId = req?.user.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const result = await req.db.query(
            `SELECT * FROM clients WHERE business_id IN (SELECT id FROM businesses WHERE owner_id = $1)`,
            [userId]
        );

        return res.status(200).json({
            message: 'Clients retrieved successfully',
            clients: result.rows,
        });
    } catch (error) {
        console.error('getClients error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const getClientById = async function (req, res)
{
    const userId = req?.user.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.params;

    try {
        const result = await req.db.query(
            `SELECT * FROM clients WHERE id = $1 AND business_id IN (SELECT id FROM businesses WHERE owner_id = $2)`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Client not found' });
        }

        return res.status(200).json({
            message: 'Client retrieved successfully',
            client: result.rows[0],
        });
    } catch (error) {
        console.error('getClientById error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const updateClient = async function (req, res) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Client id is required" });
    }
  
    const {
      company_name,
      contact_person,
      email,
      phone_number,
      address,
      tax_id,
      registration_number,
    } = req.body ?? {};
  
    const fields = [];
    const values = [];
    let idx = 1;
  
    if (company_name !== undefined)        { fields.push(`company_name = $${idx++}`);        values.push(company_name); }
    if (contact_person !== undefined)      { fields.push(`contact_person = $${idx++}`);      values.push(contact_person); }
    if (email !== undefined)               { fields.push(`email = $${idx++}`);               values.push(email); }
    if (phone_number !== undefined)        { fields.push(`phone_number = $${idx++}`);        values.push(phone_number); }
    if (address !== undefined)             { fields.push(`address = $${idx++}`);             values.push(address); }
    if (tax_id !== undefined)              { fields.push(`tax_id = $${idx++}`);              values.push(tax_id); }
    if (registration_number !== undefined) { fields.push(`registration_number = $${idx++}`); values.push(registration_number); }
  
    if (fields.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }
  
    const clientIdParam = idx++;
    const userIdParam = idx;
    values.push(id, userId);
  
    try {
      const result = await req.db.query(
        `UPDATE clients
         SET ${fields.join(", ")}
         WHERE id = $${clientIdParam}
           AND business_id IN (SELECT id FROM businesses WHERE owner_id = $${userIdParam})
         RETURNING id, business_id, company_name, contact_person, email,
                   phone_number, address, tax_id, registration_number,
                   is_archived, created_at`,
        values
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Client not found" });
      }
  
      return res.status(200).json({
        message: "Client updated successfully",
        client: result.rows[0],
      });
    } catch (error) {
      if (error.code === "23505") {
        return res
          .status(409)
          .json({ message: "Client with these details already exists" });
      }
      console.error("updateClient error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

export const deleteClient = async function (req, res)
{
    const userId = req?.user.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.params;

    try {
        const result = await req.db.query(
            `DELETE FROM clients
             WHERE id = $1 AND business_id IN (SELECT id FROM businesses WHERE owner_id = $2)
             RETURNING *`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Client not found' });
        }

        return res.status(200).json({
            message: 'Client deleted successfully',
            client: result.rows[0],
        });
    } catch (error) {
        console.error('deleteClient error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const archiveClient = async function (req, res)
{
    const userId = req?.user.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.params;

    try {
        const result = await req.db.query(
            `UPDATE clients
             SET is_archived = TRUE
             WHERE id = $1 AND business_id IN (SELECT id FROM businesses WHERE owner_id = $2)
             RETURNING *`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Client not found' });
        }

        return res.status(200).json({
            message: 'Client archived successfully',
            client: result.rows[0],
        });
    } catch (error) {
        console.error('archiveClient error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const unarchiveClient = async function (req, res)
{
    const userId = req?.user.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.params;

    try {
        const result = await req.db.query(
            `UPDATE clients
             SET is_archived = FALSE
             WHERE id = $1 AND business_id IN (SELECT id FROM businesses WHERE owner_id = $2)
             RETURNING *`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Client not found' });
        }

        return res.status(200).json({
            message: 'Client unarchived successfully',
            client: result.rows[0],
        });
    } catch (error) {
        console.error('unarchiveClient error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}