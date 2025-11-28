/**
 * D1CV Education Page
 * 
 * Lists education data from D1CV database.
 * Coming soon - placeholder for now.
 */

import { Box, Typography, Card, CardContent, Alert } from '@mui/material';
import { Construction as ConstructionIcon } from '@mui/icons-material';

export function D1CVEducationPage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        D1CV Education
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Education & certifications from the portfolio database
      </Typography>

      <Card>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <ConstructionIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Coming Soon
          </Typography>
          <Typography color="text.secondary">
            Education management will be available in a future update.
            <br />
            Currently, education data is managed via D1CV migrations.
          </Typography>
        </CardContent>
      </Card>

      <Alert severity="info" sx={{ mt: 3 }}>
        <strong>Current workflow:</strong> Edit education data using SQL migrations in the D1CV repository.
      </Alert>
    </Box>
  );
}
